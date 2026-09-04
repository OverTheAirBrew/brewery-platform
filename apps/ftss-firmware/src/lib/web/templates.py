_CSS = """

"""

def render_index(
  wifi_ok: bool,
  mqtt_ok: bool,
  message: str = "",
  msg_kind: str = "success"
) -> str:
  return f""

def render_wifi(ssid: str = "", msg_kind: str = "success", msg: str = "") -> str:
  return f""

def render_mqtt(host: str = "", port: int = 1883, username: str = "", msg_kind: str = "success", msg: str = "") -> str:
  return f""

def _esc(value:str) -> str:
  return (
    value
    .replace("&", "&amp;")
    .replace("<", "&lt;")
    .replace(">", "&gt;")
    .replace('"', "&quot;")
    .replace("'", "&#039;")
  )