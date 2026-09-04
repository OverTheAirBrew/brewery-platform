import network
from config_manager import ConfigManager
import uasyncio as asyncio

AP_SSID = "FTSS-Setup"
AP_PASSWORD = ""
AP_IP = "192.168.4.1"
AP_SUBNET = "255.255.255.0"

__CONNECTION_TIMEOUT_S = 20

class WifiManager:
  def __init__(self, config_manager: ConfigManager):
    self._config_manager = config_manager
    self._wlan = network.WLAN(network.STA_IF)
    self._ap = network.WLAN(network.AP_IF)
    
  async def connect_station(self):
    wifi = self._config_manager.get("wifi")
    ssid = wifi.get("ssid", "")
    password = wifi.get("password", "")
    
    if not ssid:
      return False
    
    self._ap.active(False)
    self._wlan.active(True)
    
    if(self._wlan.isconnected()):
      return True
    
    print(f"[WIFI] Connecting to {ssid}...")
    self._wlan.connect(ssid, password)
    
    for _ in range(__CONNECTION_TIMEOUT_S * 2):
      if self._wlan.isconnected():
        ip = self._wlan.ifconfig()[0]
        print(f"[WIFI] Connected with IP: {ip}")
        return True
      await asyncio.sleep_ms(500)
      
    print("[WIFI] Connection timed out")
    self._wlan.active(False)
    return False
  
  def start_ap_mode(self):
    self._wlan.active(False)
    self._ap.active(True)
    self._ap.config(
      essid=AP_SSID,
      mode=network.AUTH_OPEN
    )
    self._ap.ifconfig((AP_IP, AP_SUBNET, AP_IP, AP_IP))
    print(f"[WIFI] Access Point started with SSID: {AP_SSID}, IP: {AP_IP}")
    return AP_IP
  
  def stop_ap(self):
    self._ap.active(False)
    
  def is_connected(self):
    return self._wlan.isconnected()
  
  def is_ap_active(self):
    return self._ap.active()
  
  def station_ip(self):
    if self._wlan.isconnected():
      return self._wlan.ifconfig()[0]
    return None