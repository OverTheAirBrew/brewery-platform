import ujson
from device_id import device_id

__CONFIG_FILE = "config.json"

__DEFAULT_CONFIG = {
  "wifi": {
    "ssid": "",
    "password": ""
  },
  "mqtt": {
    "host": "",
    "port": 1883,
    "username": "",
    "password": ""
  },
  "sensor": {
    "id": f"sensor-{device_id()}",
    "pin": 22
  },
  "heater": {
    "id": f"heater-{device_id()}",
    "pin": 1
  },
  "cooler": {
    "id": f"cooler-{device_id()}",
    "pin": 2
  }
}

class ConfigManager:
    def __init__(self, config_file=__CONFIG_FILE):
        self.config_file = config_file
        self.config = self._load_config()
        self.save_config()

    def _load_config(self):
      try:
        with open(self.config_file, 'r') as f:
          stored = ujson.load(f)
          
        merged = {}
        for section, defaults in __DEFAULT_CONFIG.items():
          merged[section] = stored.get(section, defaults)
          merged[section].update(stored.get(section, {}))
        return merged
      except Exception as e:
        return {k: dict(v) for k, v in __DEFAULT_CONFIG.items()}

    def save_config(self):
        with open(self.config_file, 'w') as f:
            ujson.dump(self.config, f)

    def get(self, section: str, key = None) -> dict[str, str]:
        section_data = self.config.get(section, {})
        return section_data
      
    def getKey(self, section: str, key:str) -> str:
      section_data = self.config.get(section, {})
      return section_data.get(key, None)
      
    def update_section(self, section: str, data: dict):
        if section not in self.config:
            self.config[section] = {}
            
        self.config[section].update(data)
        self.save_config()
        
    def has_wifi_config(self):
        wifi_config = self.config.get("wifi", {})
        return bool(wifi_config.get("ssid") and wifi_config.get("password"))
      
    def has_mqtt_config(self):
        mqtt_config = self.config.get("mqtt", {})
        return bool(mqtt_config.get("host"))