#include "OutputController.h"

OutputController::OutputController(uint8_t heaterPin, uint8_t pumpPin)
    : heaterPin_(heaterPin), pumpPin_(pumpPin) {}

void OutputController::begin()
{
  pinMode(heaterPin_, OUTPUT);
  pinMode(pumpPin_, OUTPUT);
  turnAllOff();
}

bool OutputController::setHeater(bool enabled)
{
  const bool changed = interlock_.requestHeater(enabled);
  apply();
  if (changed && logSink_)
  {
    logSink_(enabled ? "Relay audit: heater switched on; pump switched off."
                     : "Relay audit: heater switched off.");
  }
  return changed;
}

bool OutputController::setPump(bool enabled)
{
  const bool changed = interlock_.requestPump(enabled);
  apply();
  if (changed && logSink_)
  {
    logSink_(enabled ? "Relay audit: pump switched on; heater switched off."
                     : "Relay audit: pump switched off.");
  }
  return changed;
}

void OutputController::turnAllOff()
{
  const bool changed = interlock_.turnAllOff();
  apply();
  if (changed && logSink_)
    logSink_("Relay audit: heater and pump switched off.");
}

void OutputController::setSafetyLockout(bool locked)
{
  interlock_.setLockout(locked);
  apply();
  if (locked && logSink_)
  {
    logSink_("Safety lockout enabled; relay commands can only switch loads off.");
  }
}

void OutputController::setLogSink(void (*sink)(const char *)) { logSink_ = sink; }
bool OutputController::heaterEnabled() const { return interlock_.heaterOn(); }
bool OutputController::pumpEnabled() const { return interlock_.pumpOn(); }

void OutputController::apply()
{
  digitalWrite(heaterPin_, interlock_.heaterOn() ? HIGH : LOW);
  digitalWrite(pumpPin_, interlock_.pumpOn() ? HIGH : LOW);
}
