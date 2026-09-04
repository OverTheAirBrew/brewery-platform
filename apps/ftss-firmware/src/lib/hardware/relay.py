import machine
from __generated__.ftss_device_switch_actor import FtssDeviceSwitchActor
from config_manager import ConfigManager

_RELAY_ON = 0
_RELAY_OFF = 1

class RelayController:
    def __init__(self, configManager: ConfigManager):
        self._heat = machine.Pin(configManager.get("heater", "pin"), machine.Pin.OUT, value=_RELAY_OFF)
        self._cool = machine.Pin(configManager.get("cooler", "pin"), machine.Pin.OUT, value=_RELAY_OFF)
        
        self._coolid = configManager.get("cooler", "id")
        self._heatid = configManager.get("heater", "id")
        
    def heat(self, value:int = _RELAY_ON):
        self._heat.value(value)
        self._cool.value(_RELAY_OFF)
        print(f"[RELAY] Heat relay {'ON' if value == _RELAY_ON else 'OFF'}")
        
    def cool(self, value:int = _RELAY_ON):
        self._heat.value(_RELAY_OFF)
        self._cool.value(value)
        print(f"[RELAY] Cool relay {'ON' if value == _RELAY_ON else 'OFF'}")

    def handle_command(self, command: FtssDeviceSwitchActor):
      if(command.actor_id == self._heatid):
        if(command.state == "ON"):
          self.heat(_RELAY_ON)
        else:
          self.heat(_RELAY_OFF)
      
      if(command.actor_id == self._coolid):
        if(command.state == "ON"):
          self.cool(_RELAY_ON)
        else:
          self.cool(_RELAY_OFF)
