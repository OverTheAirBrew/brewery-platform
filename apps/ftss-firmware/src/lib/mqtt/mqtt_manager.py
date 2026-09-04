from config_manager import ConfigManager
from lib.umqtt.simple import MQTTClient
import uasyncio as asyncio
from .base import MqttEvent
from device_id import device_id

_KEEP_ALIVE = 60
_POLL_MS = 100
_RECONNECT_DELAY_S = 10

def _unique_client_id() -> str:
  return f"ftss-firmware-{device_id()}"

class MqttManager:
  def __init__(self, config: ConfigManager, subscribe_events = None):
    self._config = config
    self._handlers: dict[str, MqttEvent] = {
      e.topic: e for e in (subscribe_events or [])
    }
    self._client = None
    self._connected = False
    
  def connect(self) -> bool:
    mqtt_config = self._config.get("mqtt")
    host = mqtt_config.get("host", "")
    port = int(mqtt_config.get("port", 1883))
    username = mqtt_config.get("username", "")
    password = mqtt_config.get("password", "")
    
    if not host:
      print("[MQTT] No host configured")
      return False
    
    try:
      self._client = MQTTClient(
        client_id=_unique_client_id(),
        server=host,
        port=port,
        user=username,
        password=password,
        keepalive=_KEEP_ALIVE
      )
      
      self._client.set_callback(self._dispatch)
      self._client.connect()
      self._connected = True
      print(f"[MQTT] Connected to {host}:{port}")
      
      for topic in self._handlers:
        self._client.subscribe(topic.encode())
        print(f"[MQTT] Subscribed to topic: {topic}")
        
      return True    
    except Exception as e:
      print(f"[MQTT] Client initialization failed: {e}")
      self._connected = False
      return False
    
  def disconnect(self):
    if self._client and self._connected:
      self._client.disconnect()
      self._connected = False
      print("[MQTT] Disconnected")
      
  def publish_event(self, event: MqttEvent) -> bool:
    if not self._connected:
      return False
    
    if not self._client:
      return False
    
    try:
      self._client.publish(event.topic.encode(), event.serialize().encode())
      return True
    except Exception as e:
      print(f"[MQTT] Failed to publish event: {e}")
      self._connected = False
      return False
    
  
  def _dispatch(self, topic_bytes: bytes, msg_bytes: bytes):
    topic = topic_bytes.decode()
    msg = msg_bytes.decode()
    print(f"[MQTT] Received message on topic '{topic}': {msg}")
    
    handler = self._handlers.get(topic)
    
    if handler is None:
      print(f"[MQTT] No handlers registered for topic '{topic}'")
      return
    
    try:
      payload = handler.deserialize(topic, msg)
      handler.handle(payload)
    except Exception as e:
      print(f"[MQTT] Error handling message on topic '{topic}': {e}")
      
  async def poll_loop(self):
    while True:
      if self._client and self._connected:
        try:
          self._client.check_msg()
        except Exception as e:
          print(f"[MQTT] Error checking messages: {e}")
          self._connected = False
          await asyncio.sleep(_RECONNECT_DELAY_S)
          self.connect()
          
      await asyncio.sleep_ms(_POLL_MS)
      
  @property
  def is_connected(self) -> bool:
    return self._connected