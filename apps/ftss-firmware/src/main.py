import gc
from config_manager import ConfigManager
import uasyncio as asyncio

from lib.mqtt.mqtt_manager import MqttManager
from lib.network.wifi import WifiManager
from lib.network.dns import DNSServer
from lib.web.server import WebServer

from lib.hardware.thermometer import Thermometer

from __generated__.ftss_device_switch_actor import FtssDeviceSwitchActor
from __generated__.ftss_device_temperature_reading import FtssDeviceTemperatureReading

async def _run_sensor_publish_loop(thermo: Thermometer, mqtt: MqttManager, config: ConfigManager):
  thermo.scan()
  
  while True:
    if mqtt.is_connected:
      temp = await thermo.read_celcius()
      if temp is not None:      
        event = FtssDeviceTemperatureReading(
          device_id=config.getKey("device", "id"),
          sensor_id=config.getKey("sensor", "id"),
          value=temp
        )
        mqtt.publish_event(event)
        print(f"[SENSOR] Published temperature reading: {temp:.2f} °C")
      else:
        print("[SENSOR] No temperature reading available")
    await asyncio.sleep(5)

async def _run_station_mode(config: ConfigManager, wifi: WifiManager):
  mqtt = MqttManager(config, [
    FtssDeviceSwitchActor('a', 'b', 'c')
  ])
  mqtt.connect()
  
  thermo = Thermometer(pin_number=int(config.getKey("sensor", "pin")))
  server = WebServer(config, wifi, mqtt)
  
  gc.collect()
  
  await asyncio.gather(
    server.start(),
    mqtt.poll_loop(),
    _run_sensor_publish_loop(thermo, mqtt, config)
  )
  

async def _run_ap_mode(config: ConfigManager, wifi: WifiManager):
  ap_ip = wifi.start_ap_mode()
  dns = DNSServer(redirect_ip=ap_ip)
  server = WebServer(config, wifi)
  
  gc.collect()
  
  await asyncio.gather(
    dns.run(),
    server.start()
  )

async def main():
    config = ConfigManager()
    wifi = WifiManager(config)
    
    connected = False
    if config.has_wifi_config():
        connected = await wifi.connect_station();
        
    if connected:
      print("[APP] Station Mode")
      await _run_station_mode(config, wifi)
    else:
      print("[APP] Access Point Mode")
      await _run_ap_mode(config, wifi)
    
    
    
asyncio.run(main())