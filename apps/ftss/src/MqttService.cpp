#include "MqttService.h"
#include "DeviceIdentity.h"

#include <cctype>
#include <cstring>

namespace
{
  constexpr char OTA_BP_TOPIC_PREFIX[] = "ftss";
  constexpr unsigned long STATUS_INTERVAL_MS = 2000;
  constexpr unsigned long MQTT_RETRY_INTERVAL_MS = 5000;
  constexpr unsigned long MQTT_SERVICE_INTERVAL_MS = 20;
  constexpr uint16_t MQTT_SOCKET_TIMEOUT_SECONDS = 5;
  constexpr uint16_t MQTT_KEEP_ALIVE_SECONDS = 30;
  // Wait until the local dashboard is already available before any broker work.
  // Individual attempts are short and occur no more often than every five seconds.
  constexpr unsigned long MQTT_STARTUP_GRACE_MS = 4000;
  constexpr size_t MAX_COMMAND_BYTES = 192;

  enum class ActorState : uint8_t
  {
    Invalid,
    On,
    Off
  };

  const char *skipWhitespace(const char *text)
  {
    while (*text != '\0' && isspace(static_cast<unsigned char>(*text)))
      ++text;
    return text;
  }

  // The configured MQTT username is the OTA-BP device ID. Keep this in one
  // helper so receiving and subscribing can never use different identities.
  void actorSwitchTopic(const MqttConfig &config, char *topic, size_t topicSize)
  {
    snprintf(topic, topicSize, "%s/%s/actor/switch", OTA_BP_TOPIC_PREFIX, config.mqttUsername);
  }

  // Parses exactly {"actor_id":"...","state":"on|off"} or the same two
  // fields in reverse order. Unknown fields, duplicates, and malformed JSON are rejected.
  bool parseActorCommand(const char *message, char *actorId, size_t actorIdSize, ActorState &state)
  {
    bool gotActor = false, gotState = false;
    const char *cursor = skipWhitespace(message);
    if (*cursor++ != '{')
      return false;
    while (true)
    {
      cursor = skipWhitespace(cursor);
      if (*cursor == '}')
      {
        ++cursor;
        break;
      }
      if (*cursor++ != '\"')
        return false;
      const char *key = cursor;
      while (*cursor && *cursor != '\"')
        ++cursor;
      if (*cursor != '\"')
        return false;
      const size_t keyLength = cursor++ - key;
      cursor = skipWhitespace(cursor);
      if (*cursor++ != ':')
        return false;
      cursor = skipWhitespace(cursor);
      if (*cursor++ != '\"')
        return false;
      const char *value = cursor;
      while (*cursor && *cursor != '\"')
        ++cursor;
      if (*cursor != '\"')
        return false;
      const size_t valueLength = cursor++ - value;
      if (keyLength == 8 && strncmp(key, "actor_id", 8) == 0 && !gotActor && valueLength > 0 && valueLength < actorIdSize)
      {
        memcpy(actorId, value, valueLength);
        actorId[valueLength] = '\0';
        gotActor = true;
      }
      else if (keyLength == 5 && strncmp(key, "state", 5) == 0 && !gotState)
      {
        if (valueLength == 2 && strncmp(value, "on", 2) == 0)
          state = ActorState::On;
        else if (valueLength == 3 && strncmp(value, "off", 3) == 0)
          state = ActorState::Off;
        else
          return false;
        gotState = true;
      }
      else
        return false;
      cursor = skipWhitespace(cursor);
      if (*cursor == '}')
      {
        ++cursor;
        break;
      }
      if (*cursor++ != ',')
        return false;
    }
    return gotActor && gotState && *skipWhitespace(cursor) == '\0';
  }
} // namespace

MqttService *MqttService::instance_ = nullptr;
MqttService::MqttService(MqttConfig &config, OutputController &outputs, TemperatureSensor &temperature) : config_(config), outputs_(outputs), temperature_(temperature), client_(wifiClient_) {}
void MqttService::begin()
{
  instance_ = this;
  client_.disconnect();
  client_.setServer(config_.host, config_.port);
  client_.setSocketTimeout(MQTT_SOCKET_TIMEOUT_SECONDS);
  client_.setKeepAlive(MQTT_KEEP_ALIVE_SECONDS);
  wifiClient_.setTimeout(MQTT_SOCKET_TIMEOUT_SECONDS * 1000UL);
  wasWiFiConnected_ = (WiFi.status() == WL_CONNECTED);
  mqttEligibleAt_ = millis() + MQTT_STARTUP_GRACE_MS;
  client_.setCallback(callbackThunk);
  lastConnectionError_ = 999;
  if (logSink_)
    logSink_("MQTT service started: 30-second keep-alive and 5-second socket timeout configured.");
}
void MqttService::setLogSink(void (*sink)(const char *)) { logSink_ = sink; }
bool MqttService::connected() { return client_.connected(); }
bool MqttService::lastTestSucceeded() const { return lastTestSucceeded_; }

String MqttService::testConnection(const char *host, uint16_t port, const char *username, const char *password)
{
  lastTestSucceeded_ = false;
  if (!host[0] || port == 0 || !username[0] || !password[0])
    return F("Enter a broker address, port, username, and password before testing.");
  if (WiFi.status() != WL_CONNECTED)
    return F("Connect this controller to Wi-Fi before testing MQTT.");
  // This is deliberately a temporary client configuration. The stored settings
  // and normal command connection are restored after the test.
  client_.disconnect();
  client_.setServer(host, port);
  // The test uses the same bounded timeout as the normal broker connection.
  client_.setSocketTimeout(MQTT_SOCKET_TIMEOUT_SECONDS);
  client_.setKeepAlive(MQTT_KEEP_ALIVE_SECONDS);
  wifiClient_.setTimeout(MQTT_SOCKET_TIMEOUT_SECONDS * 1000UL);
  const String clientId = controllerDeviceName();
  if (!client_.connect(clientId.c_str(), username, password))
  {
    wifiClient_.setTimeout(MQTT_SOCKET_TIMEOUT_SECONDS * 1000UL);
    client_.setServer(config_.host, config_.port);
    return String(F("Could not connect to the MQTT broker (error ")) + client_.state() + F("). Check the broker address, port, username, password, and network.");
  }
  char payload[128];
  snprintf(payload, sizeof(payload), "{\"controller_id\":\"%s\"}", controllerDeviceName().c_str());
  const bool published = client_.publish("platform/test-connection", payload, false);
  client_.disconnect();
  wifiClient_.setTimeout(MQTT_SOCKET_TIMEOUT_SECONDS * 1000UL);
  client_.setServer(config_.host, config_.port);
  if (!published)
    return F("Connected to the broker, but could not publish the test message.");
  lastTestSucceeded_ = true;
  return String(F("Connected to ")) + host + F(":") + port + F(" and published a test message to platform/test-connection. These values were not saved.");
}

// The MQTT username is also the OTA-BP device ID. Actor IDs are optional
// assignments: empty IDs simply cannot match a switch command.
bool MqttService::configurationComplete() const { return config_.host[0] && config_.port && config_.mqttUsername[0] && config_.mqttPassword[0] && config_.otaBpSensorId[0]; };
void MqttService::tick()
{
  const unsigned long now = millis();
  const bool wifiConnected = (WiFi.status() == WL_CONNECTED);
  if (wifiConnected && !wasWiFiConnected_)
  {
    mqttEligibleAt_ = now + MQTT_STARTUP_GRACE_MS;
  }
  wasWiFiConnected_ = wifiConnected;
  if (now - lastServiceAt_ >= MQTT_SERVICE_INTERVAL_MS)
  {
    lastServiceAt_ = now;
    connectIfNeeded();
    if (client_.connected())
      client_.loop();
  }
  if (now - lastStatusAt_ >= STATUS_INTERVAL_MS)
  {
    lastStatusAt_ = now;
    publishStatus();
  }
}
void MqttService::publishStatus()
{
  if (!client_.connected())
    return;

  float temperatureC = 0;
  const bool sensorFound = temperature_.readCelsius(temperatureC);

  // MQTT is used only for the FTSS sensor feed. A missing probe is deliberately
  // not published as a plausible numeric temperature. Log the fault once, then
  // log recovery if the probe returns, so the 24-line audit remains useful.
  if (!sensorFound)
  {
    if (logSink_ && (!sensorStateKnown_ || sensorWasFound_))
      logSink_("Temperature fault: no DS18B20 thermometer was found. Check the RJ11 probe, 4.7 kΩ pull-up resistor, and connector wiring.");
    sensorStateKnown_ = true;
    sensorWasFound_ = false;
    return;
  }
  if (logSink_ && sensorStateKnown_ && !sensorWasFound_)
    logSink_("Temperature probe recovered; readings are available again.");
  sensorStateKnown_ = true;
  sensorWasFound_ = true;
  char temperatureTopic[192];
  // Both IDs come from the saved MQTT configuration: the username supplies
  // the device ID and otaBpSensorId supplies the sensor ID.
  snprintf(temperatureTopic, sizeof(temperatureTopic), "%s/%s/sensor/%s/reading", OTA_BP_TOPIC_PREFIX, config_.mqttUsername, config_.otaBpSensorId);
  // Build the JSON from Arduino's float-to-text conversion rather than printf's
  // floating-point formatter. This guarantees a populated, numeric Celsius value
  // even on embedded builds that omit printf float support to save flash space.
  const String celsiusValue = String(temperatureC, 2);
  const String temperaturePayload = String(F("{\"payload\":{\"value\":")) + celsiusValue + F("}}");
  if (client_.publish(temperatureTopic, temperaturePayload.c_str(), true))
  {
    if (logSink_)
    {
      char message[144];
      snprintf(message, sizeof(message), "Temperature %s C sent as payload.value to ftss/%s/sensor/%s/reading.", celsiusValue.c_str(), config_.mqttUsername, config_.otaBpSensorId);
      logSink_(message);
    }
  }
  else if (logSink_)
    logSink_("Temperature reading was available, but sending it to MQTT failed.");
}
void MqttService::callbackThunk(char *topic, byte *payload, unsigned int length)
{
  if (instance_)
    instance_->handleMessage(topic, payload, length);
}
void MqttService::handleMessage(char *topic, byte *payload, unsigned int length)
{
  if (length == 0 || length >= MAX_COMMAND_BYTES)
    return;
  char actorTopic[160];
  actorSwitchTopic(config_, actorTopic, sizeof(actorTopic));
  char message[MAX_COMMAND_BYTES], actorId[65] = {};
  if (strcmp(topic, actorTopic) != 0)
    return;
  memcpy(message, payload, length);
  message[length] = '\0';
  ActorState state = ActorState::Invalid;
  if (!parseActorCommand(message, actorId, sizeof(actorId), state))
    return;
  if (strcmp(actorId, config_.heaterActorId) == 0)
    outputs_.setHeater(state == ActorState::On);
  else if (strcmp(actorId, config_.coolerActorId) == 0)
    outputs_.setPump(state == ActorState::On);
}
void MqttService::connectIfNeeded()
{
  const unsigned long now = millis();
  if (client_.connected() || WiFi.status() != WL_CONNECTED || !configurationComplete() || (long)(now - mqttEligibleAt_) < 0)
    return;
  if (now - lastMqttAttemptAt_ < MQTT_RETRY_INTERVAL_MS)
    return;
  lastMqttAttemptAt_ = now;
  if (logSink_)
    logSink_("MQTT connection attempt started.");
  const String clientId = controllerDeviceName();
  if (!client_.connect(clientId.c_str(), config_.mqttUsername, config_.mqttPassword))
  {
    const int error = client_.state();
    if (logSink_ && error != lastConnectionError_)
    {
      char message[72];
      snprintf(message, sizeof(message), "MQTT connection failed (error %d); retrying in 5 seconds.", error);
      logSink_(message);
    }
    lastConnectionError_ = error;
    return;
  }
  char actorTopic[160];
  actorSwitchTopic(config_, actorTopic, sizeof(actorTopic));
  lastConnectionError_ = 0;
  if (client_.subscribe(actorTopic))
  {
    if (logSink_)
      logSink_("MQTT connected and configured actor-switch topic subscribed.");
  }
  else if (logSink_)
    logSink_("MQTT connected, but actor-switch subscription failed.");
  publishStatus();
}
