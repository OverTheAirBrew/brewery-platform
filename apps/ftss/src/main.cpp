#include <Arduino.h>
#include <EEPROM.h>
#include <WiFi.h>

#include "AppConfig.h"
#include "ConfigWebServer.h"
#include "MqttService.h"
#include "OutputController.h"
#include "TemperatureSensor.h"

void updateStatusLed();

// Routes MQTT service events into the protected in-memory UI log.
void mqttLogSink(const char *message);

constexpr uint8_t RELAY_HEATER_PIN = 2;
constexpr uint8_t RELAY_PUMP_PIN = 3;
constexpr uint8_t ONEWIRE_PIN = 22;

MqttConfig config;
OutputController outputs(RELAY_HEATER_PIN, RELAY_PUMP_PIN);
TemperatureSensor temperature(ONEWIRE_PIN);
MqttService mqtt(config, outputs, temperature);
ConfigWebServer configWeb(config, mqtt, outputs, temperature);

void mqttLogSink(const char *message) { configWeb.log(message); }

void updateStatusLed()
{
  const unsigned long phase = millis() % 2000UL;
  bool ledOn = false;
  switch (configWeb.wifiIndicatorState())
  {
  case 1:
    // Setup network ready: three quick flashes, then a pause.
    ledOn = phase < 120UL || (phase >= 260UL && phase < 380UL) ||
            (phase >= 520UL && phase < 640UL);
    break;
  case 2:
    // Starting the setup network: a fast even blink.
    ledOn = (millis() % 300UL) < 150UL;
    break;
  case 3:
    // Joined to the router: steady on. MQTT does not affect this light.
    ledOn = true;
    break;
  default:
    // Trying saved Wi-Fi details: two quick flashes, then a long pause.
    ledOn = phase < 120UL || (phase >= 260UL && phase < 380UL);
    break;
  }
  digitalWrite(LED_BUILTIN, ledOn ? HIGH : LOW);
}

void setup()
{
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  outputs.begin();
  Serial.begin(115200);
  const unsigned long started = millis();
  while (!Serial && millis() - started < 2000UL)
    delay(10);

  Serial.println();
  Serial.println(F("Heater controller booting"));
  EEPROM.begin(EEPROM_BYTES);
  const bool cleanDefaultsApplied = applyCleanDefaultsRelease(config);
  if (cleanDefaultsApplied)
  {
    Serial.println(F("Clean-defaults release applied: saved settings were erased."));
  }
  else
  {
    const ConfigLoadResult configResult = loadConfig(config);
    Serial.println(configLoadResultText(configResult));
  }
  if (config.wifiSsid[0] != '\0')
  {
    Serial.print(F("Saved Wi-Fi name loaded: "));
    Serial.println(config.wifiSsid);
  }
  else
  {
    Serial.println(F("No saved Wi-Fi name."));
  }

  temperature.begin();
  configWeb.begin();
  mqtt.setLogSink(mqttLogSink);
  outputs.setLogSink(mqttLogSink);
  configWeb.log("Boot audit: controller startup began; outputs initialized off.");
  configWeb.log(cleanDefaultsApplied ? "Startup: clean defaults applied." : "Startup: saved settings load completed.");
  configWeb.log(config.wifiSsid[0] ? "Startup: saved Wi-Fi settings found." : "Startup: no saved Wi-Fi settings.");
  configWeb.log("Boot audit: temperature probe service started; waiting for first reading.");
  if (configWeb.wifiConfigured())
  {
    Serial.println(F("Starting saved Wi-Fi connection window (3 minutes)."));
    configWeb.log("Startup: starting saved Wi-Fi connection window.");
    configWeb.connectSavedWiFi();
  }
  else
  {
    Serial.println(F("Entering setup AP mode."));
    configWeb.log("Startup: entering open Wi-Fi setup mode.");
    configWeb.startWiFiSetup();
  }
  mqtt.begin();
}

void loop()
{
  temperature.tick();
  configWeb.tick();
  mqtt.tick();
  if (configWeb.takeMqttRestartRequest())
    mqtt.begin();
  if (configWeb.takeWiFiReconfigureRequest())
  {
    outputs.turnAllOff();
    configWeb.connectSavedWiFi();
    mqtt.begin();
  }
  updateStatusLed();
}