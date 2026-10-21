#pragma once

#include <Arduino.h>

#include "SafetyInterlock.h"

class OutputController
{
public:
  OutputController(uint8_t heaterPin, uint8_t pumpPin);
  void begin();
  bool setHeater(bool enabled);
  bool setPump(bool enabled);
  void turnAllOff();
  // Used during a firmware upload. While locked, commands can only turn loads off.
  void setSafetyLockout(bool locked);
  // Receives plain-language relay state changes for the protected audit log.
  void setLogSink(void (*sink)(const char *));
  bool heaterEnabled() const;
  bool pumpEnabled() const;

private:
  void apply();
  uint8_t heaterPin_;
  uint8_t pumpPin_;
  SafetyInterlock interlock_;
  void (*logSink_)(const char *) = nullptr;
};
