from ..templates import config as config_templates
from .common import html, redirect, banner_args, schedule_reset, DeviceContext
from ...microdot import microdot


def register(app, ctx):
  _register_wifi(app, ctx)
  
  
def _register_wifi(app: microdot.Microdot, ctx: DeviceContext):
  @app.route("/config/wifi", methods=["GET"])
  async def wifi_get(request: microdot.Request):
    msg, kind = banner_args(request)
    return html(config_templates.render_wifi(
      ssid=ctx.config.getKey("wifi", "ssid"),
      message=msg,
      msg_kind=kind
    ))
    
  @app.route("/config/wifi", methods=["POST"])
  async def wifi_post(request: microdot.Request):
    form = request.form
    
    if form is None:
      return redirect("/config/wifi?msg=Invalid+form+data&kind=danger")
    
    ssid = (form.get("ssid") or "").strip()
    password = (form.get("password") or "").strip()
    
    if not ssid:
      return redirect("/config/wifi?msg=SSID+is+required&kind=danger")
    
    ctx.config.update_section("wifi", {"ssid": ssid, "password": password})
    schedule_reset()
        
    return redirect("/?msg=Wi-Fi+configuration+updated.+Device+will+reset...")
  
