#pragma once

#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>

#include "AppConfig.h"
#include "OutputController.h"
#include "TemperatureSensor.h"

class MqttService
{
public:
  MqttService(MqttConfig &config, OutputController &outputs, TemperatureSensor &temperature);
  void begin();
  void tick();
  void publishStatus();
  bool connected();
  // Makes one user-requested publish-only test using values supplied by the web page.
  // It never saves settings, changes either relay output, or subscribes to actor commands.
  String testConnection(const char *host, uint16_t port, const char *username, const char *password);
  bool lastTestSucceeded() const;
  // Supplies the protected UI/serial event logger after the web server starts.
  void setLogSink(void (*sink)(const char *));

private:
  static void callbackThunk(char *topic, byte *payload, unsigned int length);
  void handleMessage(char *topic, byte *payload, unsigned int length);
  bool configurationComplete() const;
  void connectIfNeeded();

  static MqttService *instance_;
  MqttConfig &config_;
  OutputController &outputs_;
  TemperatureSensor &temperature_;
  WiFiClient wifiClient_;
  PubSubClient client_;
  unsigned long lastStatusAt_ = 0;
  unsigned long lastMqttAttemptAt_ = 0;
  unsigned long lastServiceAt_ = 0;
  unsigned long mqttEligibleAt_ = 0;
  bool wasWiFiConnected_ = false;
  bool lastTestSucceeded_ = false;
  void (*logSink_)(const char *) = nullptr;
  int lastConnectionError_ = 999;
  bool sensorStateKnown_ = false;
  bool sensorWasFound_ = false;
};
