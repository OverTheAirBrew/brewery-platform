#pragma once

#include <Arduino.h>
#include <DallasTemperature.h>
#include <OneWire.h>

class TemperatureSensor
{
public:
  explicit TemperatureSensor(uint8_t oneWirePin);
  void begin();
  void tick();
  bool readCelsius(float &temperatureC);

private:
  OneWire oneWire_;
  DallasTemperature sensor_;
  float lastTemperatureC_ = DEVICE_DISCONNECTED_C;
  bool conversionPending_ = false;
  unsigned long conversionStartedAt_ = 0;
  unsigned long lastRequestAt_ = 0;
};
