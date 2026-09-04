from lib.microdot.microdot import Microdot, Request
from . import templates
from config_manager import ConfigManager
from lib.network.wifi import WifiManager
from lib.mqtt.mqtt_manager import MqttManager

_CAPTIVE_PATHS = {
  "/generate_204",
  "hotspot-detect.html",
  "/ncsi.txt",
  "/connecttest.txt",
  "/redirect",
  "/canonical.html"
}

_HTML = "text/html"
_PORT = 80

class WebServer:
  def __init__(self, config_manager: ConfigManager, wifi_manager: WifiManager, mqtt_manager = None):
    self._config = config_manager
    self._wifi = wifi_manager
    self._mqtt = mqtt_manager
  
    self._app = Microdot()
    
  async def start(self):
    await self._app.run(host="0.0.0.0", port=_PORT, debug=False) # type: ignore
    
  def _register_routes(self):
    app = self._app
    
    @app.route("/<path:path>", methods=["GET"])
    async def catch_all(request, path):
      if f"/{path}" in _CAPTIVE_PATHS or self._wifi.is_connected():
        return "", 302, {"Location": "/"}
      return "Not Found", 404
    
    @app.route("/", methods=["GET"])
    async def index(request: Request):
      msg = str(request.args.get("msg", ""))
      kind = str(request.args.get("kind", "success"))
      html = templates.render_index(
        wifi_ok=self._wifi.is_connected(),
        mqtt_ok=self._mqtt.is_connected if self._mqtt else False,
        message=msg,
        msg_kind=kind
      )
      
      return html, 200, {"Content-Type": _HTML}
    
    @app.route("/config/wifi", methods=["GET"])
    async def wifi_config(request: Request):
      msg = str(request.args.get("msg", ""))
      kind = str(request.args.get("kind", "success"))
      html = templates.render_wifi(
        ssid=self._config.getKey("wifi", "ssid"),
        msg_kind=kind,
        msg=msg
      )
      return html, 200, {"Content-Type": _HTML}
    
    @app.route("/config/mqtt", methods=["GET"])
    async def mqtt_config(request: Request):
      msg = str(request.args.get("msg", ""))
      kind = str(request.args.get("kind", "success"))
      html = templates.render_mqtt(
        host=self._config.getKey("mqtt", "host"),
        port=int(self._config.getKey("mqtt", "port")),
        username=self._config.getKey("mqtt", "username"),
        msg_kind=kind,
        msg=msg
      )
      return html, 200, {"Content-Type": _HTML}
    