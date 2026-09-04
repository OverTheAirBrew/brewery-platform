import machine
import onewire
import ds18x20

import uasyncio as asyncio
from config_manager import ConfigManager

__CONVERSION_MS = 750  # milliseconds

class Thermometer:
    def __init__(self, pin_number):
        pin = machine.Pin(pin_number)
        self._ow = onewire.OneWire(pin)
        self._ds = ds18x20.DS18X20(self._ow)
        self._roms = []
        
    def scan(self) -> int:
        self._roms = self._ds.scan()
        count = len(self._roms)
        print(f"[THERMOMETER] Found {count} device(s)")
        return count
      
    async def read_celcius(self):
        if not self._roms:
            if self.scan() == 0:
              return None
        
        self._ds.convert_temp()
        await asyncio.sleep_ms(__CONVERSION_MS)  # Wait for conversion to complete
        
        try:
          temp = float(self._ds.read_temp(self._roms[0]))
          print(f"[THERMOMETER] Temperature: {temp:.2f} °C")
          return temp
        except Exception as e:
          print(f"[THERMOMETER] Error reading temperature: {e}")
          return None