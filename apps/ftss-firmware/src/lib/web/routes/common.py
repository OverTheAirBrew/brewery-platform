import machine
import uasyncio as asyncio

HTML = "text/html"

class DeviceContext:
  def __init__(self, config, wifi, mqtt=None, relay=None, thermometer=None):
    self.config = config
    self.wifi = wifi
    self.mqtt = mqtt
    self.relay = relay
    self.thermometer = thermometer
    
  @property
  def mqtt_connected(self):
    return self.mqtt.is_connected if self.mqtt else False
  
  def sensor_id(self):
    return self.thermometer.sensor_id if self.thermometer else None
  
def html(body:str):
  return body, 200, {"Content-Type": HTML}

def redirect(location:str):
  return "", 302, {"Location": location}

def banner_args(request):
  return request.args.get("msg", ""), request.args.get("kind", "success")

def schedule_reset(delay_ms:int = 2000):
  print(f"[SYSTEM] Scheduling device reset in {delay_ms} ms")
  asyncio.get_event_loop().create_task(_delayed_reset(delay_ms))

async def _delayed_reset(delay_ms):
  await asyncio.sleep_ms(delay_ms)
  machine.reset()