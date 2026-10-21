#include <cassert>
#include <iostream>

#include "SafetyInterlock.h"

int main()
{
  SafetyInterlock outputs;
  assert(!outputs.heaterOn());
  assert(!outputs.pumpOn());

  assert(outputs.requestHeater(true));
  assert(outputs.heaterOn() && !outputs.pumpOn());
  assert(outputs.requestPump(true));
  assert(!outputs.heaterOn() && outputs.pumpOn());

  outputs.setLockout(true);
  assert(outputs.locked());
  assert(!outputs.heaterOn() && !outputs.pumpOn());
  assert(!outputs.requestHeater(true));
  assert(!outputs.requestPump(true));
  assert(!outputs.heaterOn() && !outputs.pumpOn());

  // Commands to turn a load off remain harmless during a lockout.
  assert(!outputs.requestHeater(false));
  outputs.setLockout(false);
  assert(outputs.requestHeater(true));
  assert(outputs.heaterOn() && !outputs.pumpOn());

  std::cout << "Safety interlock unit tests passed.\n";
  return 0;
}