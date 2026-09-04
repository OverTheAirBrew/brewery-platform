from .layout import page, msg_banner, esc

def render_wifi(ssid: str = "", message: str = "", msg_kind: str = "success") -> str:
  body = f"""
  <a class="back" href="/">Back</a>
  <h1>Wi-Fi Configuration</h1>
  <p class="subtitle">Configure the Wi-Fi settings for the device.</p>
  {msg_banner(message, msg_kind)}
  """
  
  return page("Wi-Fi Configuration", body)