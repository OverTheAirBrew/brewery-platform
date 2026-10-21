#pragma once

// Hardware-free relay state machine. It intentionally contains no Arduino
// headers so the same safety rules can be tested in continuous integration.
class SafetyInterlock
{
public:
  bool requestHeater(bool enabled)
  {
    if (enabled && locked_)
      return false;
    const bool changed = heaterOn_ != enabled || (enabled && pumpOn_);
    heaterOn_ = enabled;
    if (enabled)
      pumpOn_ = false;
    return changed;
  }

  bool requestPump(bool enabled)
  {
    if (enabled && locked_)
      return false;
    const bool changed = pumpOn_ != enabled || (enabled && heaterOn_);
    pumpOn_ = enabled;
    if (enabled)
      heaterOn_ = false;
    return changed;
  }

  bool turnAllOff()
  {
    const bool changed = heaterOn_ || pumpOn_;
    heaterOn_ = false;
    pumpOn_ = false;
    return changed;
  }

  void setLockout(bool locked)
  {
    locked_ = locked;
    if (locked_)
      turnAllOff();
  }

  bool heaterOn() const { return heaterOn_; }
  bool pumpOn() const { return pumpOn_; }
  bool locked() const { return locked_; }

private:
  bool heaterOn_ = false;
  bool pumpOn_ = false;
  bool locked_ = false;
};
