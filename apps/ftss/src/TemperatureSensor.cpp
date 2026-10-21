#include "TemperatureSensor.h"

constexpr unsigned long TEMPERATURE_INTERVAL_MS = 2000UL;
constexpr unsigned long TEMPERATURE_CONVERSION_MS = 800UL;

TemperatureSensor::TemperatureSensor(uint8_t oneWirePin)
    : oneWire_(oneWirePin), sensor_(&oneWire_) {}

void TemperatureSensor::begin()
{
  sensor_.begin();
  sensor_.setWaitForConversion(false);
  lastRequestAt_ = millis() - TEMPERATURE_INTERVAL_MS;
}

void TemperatureSensor::tick()
{
  const unsigned long now = millis();
  if (conversionPending_ && now - conversionStartedAt_ >= TEMPERATURE_CONVERSION_MS)
  {
    lastTemperatureC_ = sensor_.getTempCByIndex(0);
    conversionPending_ = false;
  }
  if (!conversionPending_ && now - lastRequestAt_ >= TEMPERATURE_INTERVAL_MS)
  {
    sensor_.requestTemperatures();
    conversionStartedAt_ = now;
    lastRequestAt_ = now;
    conversionPending_ = true;
  }
}

bool TemperatureSensor::readCelsius(float &temperatureC)
{
  temperatureC = lastTemperatureC_;
  return temperatureC != DEVICE_DISCONNECTED_C;
}
