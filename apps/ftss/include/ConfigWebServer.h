#pragma once

#include <Arduino.h>
#include <WebServer.h>
#include <WiFiUdp.h>
#include <LittleFS.h>

#include "AppConfig.h"
#include "MqttService.h"
#include "OutputController.h"
#include "TemperatureSensor.h"

class ConfigWebServer
{
public:
  ConfigWebServer(MqttConfig &config, MqttService &mqtt, OutputController &outputs,
                  TemperatureSensor &temperature);
  void begin();
  void tick();
  bool takeMqttRestartRequest();
  bool takeWiFiReconfigureRequest();
  bool wifiConfigured() const;
  // 0 = joining saved Wi-Fi, 1 = setup network is ready, 2 = AP start failed,
  // 3 = connected to saved Wi-Fi.
  uint8_t wifiIndicatorState() const;
  void startWiFiSetup();
  void connectSavedWiFi();
  // Adds a short event to the protected on-device diagnostic screen.
  void log(const char *message);

private:
  bool authenticated();
  void showDashboard();
  void sendStatusJson();
  void showConfigPage();
  void showWiFiConfigPage();
  void showResetPage();
  void showUpdatePage();
  void showLogsPage();
  void sendLogsJson();
  void appendConfigTabs(String &page, const char *activeTab);
  void saveConfigPage();
  void testMqttConnection();
  void showPasswordPage();
  void savePasswordPage();
  void showFactoryResetPage();
  void restoreFactorySettings();
  String deviceName() const;
  void showWiFiSetupPage();
  void saveWiFiSetupPage();
  void handleFirmwareUpload();
  void resetFirmwareUploadState();
  void startAccessPoint();
  bool applyStationHostname(const String &hostname);
  void sendCaptiveRedirect();
  void handleCaptiveDns();
  void scheduleRestart();
  void sendRestartPage(const char *title, const char *message);

  MqttConfig &config_;
  MqttService &mqtt_;
  OutputController &outputs_;
  TemperatureSensor &temperature_;
  WebServer server_;
  WiFiUDP dnsServer_;
  bool mqttRestartRequested_ = false;
  bool wifiReconfigureRequested_ = false;
  bool provisioning_ = false;
  bool wifiConnectionPending_ = false;
  bool connectAfterSetupPage_ = false;
  bool accessPointStarted_ = false;
  bool firmwareUploadFailed_ = false;
  bool firmwareUploadComplete_ = false;
  bool firmwareUploadStarted_ = false;
  size_t declaredFirmwareBytes_ = 0;
  size_t receivedFirmwareBytes_ = 0;
  File stagedFirmwareFile_;
  unsigned long wifiConnectionStartedAt_ = 0;
  unsigned long wifiAttemptStartedAt_ = 0;
  unsigned long nextWiFiAttemptAt_ = 0;
  unsigned long connectAfterSetupAt_ = 0;
  unsigned long lastAccessPointAttemptAt_ = 0;
  unsigned long restartAt_ = 0;
  bool restartPending_ = false;
  static constexpr uint8_t MAX_LOG_LINES = 24;
  String logLines_[MAX_LOG_LINES];
  uint8_t logFirst_ = 0;
  uint8_t logCount_ = 0;
};
