#include "ConfigWebServer.h"
#include "DeviceIdentity.h"
#include "LogoConfig.h"

#include <LittleFS.h>
#include <PicoOTA.h>
#include <WiFi.h>
#include <cstring>

namespace
{
  constexpr char CONFIG_USER[] = "admin";
  // Let one association + DHCP exchange finish before interrupting it. A new
  // WiFi.begin() is only issued after a clean disconnect and short back-off.
  constexpr unsigned long WIFI_CONNECT_TIMEOUT_MS = 60000UL;
  constexpr unsigned long WIFI_ATTEMPT_TIMEOUT_MS = 30000UL;
  constexpr unsigned long WIFI_RETRY_INTERVAL_MS = 5000UL;

  // Served once as a cacheable asset. HTML pages only reference this URL, so
  // switching tabs does not copy the stylesheet into each page response.
  constexpr char CONTROLLER_CSS[] = R"CSS(
:root{color-scheme:dark;--bg:#0b1220;--card:#141e30;--line:#2a3954;--text:#f4f7fb;--muted:#aebbd0;--good:#43d6ad;--blue:#54a8ff;--bad:#ff7d8e}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top right,#17385a 0,var(--bg) 42%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{width:min(100%,46rem);margin:auto;padding:2rem 1.15rem 3rem}.brand{display:flex;align-items:center;gap:.8rem;margin:0 0 1.5rem}.badge{display:grid;place-items:center;width:2.75rem;height:2.75rem;border-radius:.8rem;background:linear-gradient(135deg,var(--good),var(--blue));color:#06101d;font-weight:850}.logo-image{object-fit:contain;padding:.15rem;background:#fff}.brand strong{display:block}.brand span,p{color:var(--muted)}.brand span{font-size:.85rem}.card{margin-bottom:1rem;padding:1.35rem;border:1px solid var(--line);border-radius:1.25rem;background:rgba(20,30,48,.95);box-shadow:0 1.25rem 3rem #0004}h1{margin:0 0 .55rem;font-size:1.55rem}h2{margin:0 0 1rem;font-size:1rem}p{line-height:1.55}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}.group{margin-top:1.15rem}.group h2{margin:0 0 .65rem;color:var(--muted);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase}.stat{padding:1rem;border:1px solid var(--line);border-radius:.85rem;background:#0b1424}.stat small{display:block;margin-bottom:.3rem;color:var(--muted)}.ok{color:var(--good)}.off{color:var(--muted)}.warn{color:var(--bad)}.tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;margin:0 0 1rem}.tab{padding:.72rem .2rem;border:1px solid var(--line);border-radius:.7rem;background:#141e30;color:var(--muted);font-size:.82rem;font-weight:700;text-align:center;text-decoration:none}.tab.active{border-color:var(--good);background:rgba(67,214,173,.14);color:var(--good)}label{display:block;margin:1rem 0 .4rem;font-weight:650}input{width:100%;padding:.82rem .9rem;border:1px solid var(--line);border-radius:.7rem;background:#0b1424;color:var(--text);font:inherit}button,.button{display:inline-block;width:100%;margin-top:1rem;padding:.9rem 1rem;border:0;border-radius:.7rem;background:var(--good);color:#052018;font:700 1rem inherit;text-align:center;text-decoration:none;cursor:pointer;transition:filter .15s ease,transform .15s ease}button:hover:not(:disabled),.button:hover{filter:brightness(1.08);transform:translateY(-1px)}button:disabled{cursor:not-allowed;opacity:.55;filter:none;transform:none}.secondary{background:#263750;color:var(--text)}.progress-wrap{display:none;margin-top:1rem}.progress-wrap.visible{display:block}.progress-track{height:.7rem;overflow:hidden;border:1px solid var(--line);border-radius:99px;background:#0b1424}.progress-bar{width:0;height:100%;background:linear-gradient(90deg,var(--good),var(--blue));transition:width .16s ease}.progress-label{margin:.45rem 0 0;color:var(--muted);font-size:.88rem}.danger{background:var(--bad);color:#350711}.notice{padding:.85rem;border:1px solid #2a695a;border-radius:.75rem;background:#12352e;color:#d3ffef;white-space:pre-wrap;overflow-wrap:anywhere;min-height:3.5rem}.restart-wait{display:flex;align-items:center;gap:.8rem;margin:1.2rem 0;padding:.9rem;border:1px solid var(--line);border-radius:.8rem;background:#0b1424}.spinner{width:1.35rem;height:1.35rem;flex:0 0 auto;border:.18rem solid var(--line);border-top-color:var(--good);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.restart-wait p{margin:0}.restart-wait strong{display:block;color:var(--text)}@media(max-width:28rem){.grid{grid-template-columns:1fr}.tabs{grid-template-columns:repeat(2,1fr)}}
/* Shared controls: every page uses the same focus, hover, disabled and theme treatment. */
.theme-toggle{width:auto;margin:0 0 0 auto;padding:.55rem .72rem;border:1px solid var(--line);border-radius:.7rem;background:#263750;color:var(--text);font-size:.82rem;white-space:nowrap}.theme-toggle:hover{filter:brightness(1.08);transform:translateY(-1px)}button:focus-visible,.button:focus-visible,.tab:focus-visible,input:focus-visible,.theme-toggle:focus-visible{outline:3px solid rgba(67,214,173,.45);outline-offset:2px}.tab:hover{border-color:var(--good);color:var(--text)}body.light{color-scheme:light;--bg:#edf3f8;--card:#ffffff;--line:#c8d5e1;--text:#142231;--muted:#526579;--good:#087a62;--blue:#176fc4;--bad:#b62645;background:radial-gradient(circle at top right,#d6ecff 0,var(--bg) 42%)}body.light .card,body.light .tab{background:rgba(255,255,255,.96);box-shadow:0 1.25rem 3rem #2947621f}body.light .stat,body.light input{background:#f6f9fc}body.light .secondary,body.light .theme-toggle{background:#dce7f1;color:var(--text)}body.light .notice{background:#e4f8f1;border-color:#8dc9b8;color:#174b40}body.light .restart-wait{background:#f6f9fc}body.light .tab.active{background:#d9f3eb}.theme-toggle .theme-icon{margin-right:.35rem}
)CSS";
  constexpr char CONTROLLER_JS[] = R"JS(
(()=>{const q=id=>document.getElementById(id),key='heater-controller-theme';function theme(mode){const light=mode==='light';document.body.classList.toggle('light',light);localStorage.setItem(key,light?'light':'dark');const b=q('theme-toggle');if(b){b.innerHTML=light?'<span class="theme-icon" aria-hidden="true">☾</span>Dark mode':'<span class="theme-icon" aria-hidden="true">☀</span>Light mode';b.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');}}theme(localStorage.getItem(key)==='light'?'light':'dark');const toggle=q('theme-toggle');if(toggle)toggle.onclick=()=>theme(document.body.classList.contains('light')?'dark':'light');const set=(id,text,ok)=>{const e=q(id);if(e){e.textContent=text;e.className=ok?'ok':'warn';}};async function load(){if(!q('temperature'))return;try{const r=await fetch('/status',{cache:'no-store'});if(!r.ok)throw 0;const s=await r.json();set('temperature',s.temperature,s.sensorOk);set('heater',s.heater?'On':'Off',s.heater);set('pump',s.pump?'On':'Off',s.pump);set('wifi',s.wifi?'Connected':'Disconnected',s.wifi);set('ssid',s.ssid,s.wifi);set('mqtt',s.mqtt?'Connected':'Disconnected',s.mqtt);set('address',s.address,s.wifi);}catch(e){['temperature','heater','pump','wifi','ssid','mqtt','address'].forEach(id=>set(id,'Unavailable',false));}}load();setInterval(load,2000);})();
)JS";
  String apName() { return controllerDeviceName(); }
  void appendBrandLogo(String &out)
  {
    if (CONTROLLER_LOGO_BASE64[0] != '\0')
    {
      out += F("<img class='badge logo-image' src='data:");
      out += CONTROLLER_LOGO_MIME;
      out += F(";base64,");
      out += CONTROLLER_LOGO_BASE64;
      out += F("' alt='Controller logo'>");
    }
    else
      out += F("<div class='badge' aria-label='Heater Controller'>HC</div>");
  }
  String pageStart(const char *title)
  {
    String p = F("<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>");
    p += title;
    p += F("</title><link rel='stylesheet' href='/assets/controller.css'><link rel='preload' href='/assets/controller.js' as='script'><script src='/assets/controller.js' defer></script></head><body><main><header class='brand'>");
    appendBrandLogo(p);
    p += F("<div><strong>");
    p += controllerDeviceName();
    p += F("</strong><span>Local control and configuration</span></div><button id='theme-toggle' class='theme-toggle' type='button' aria-label='Switch appearance'><span class='theme-icon' aria-hidden='true'>☀</span>Light mode</button></header>");
    return p;
  }
  void appendEscaped(String &out, const char *text)
  {
    for (; *text; ++text)
    {
      if (*text == '&')
        out += F("&amp;");
      else if (*text == '<')
        out += F("&lt;");
      else if (*text == '>')
        out += F("&gt;");
      else if (*text == '\'')
        out += F("&#39;");
      else
        out += *text;
    }
  }
}

ConfigWebServer::ConfigWebServer(MqttConfig &config, MqttService &mqtt, OutputController &outputs, TemperatureSensor &temperature) : config_(config), mqtt_(mqtt), outputs_(outputs), temperature_(temperature), server_(80) {}
void ConfigWebServer::begin()
{
  // The browser sends the exact UF2 byte count in this header.  Multipart uploads
  // otherwise report a zero total at UPLOAD_FILE_START on Arduino-Pico.
  // Arduino-Pico's WebServer takes header names directly, rather than ESP32's
  // array-and-count form.
  server_.collectHeaders("X-Firmware-Size");
  server_.on("/", HTTP_GET, [this]()
             { provisioning_ ? showWiFiSetupPage() : showDashboard(); });
  server_.on("/status", HTTP_GET, [this]()
             { sendStatusJson(); });
  server_.on("/config", HTTP_GET, [this]()
             { showConfigPage(); });
  server_.on("/config", HTTP_POST, [this]()
             { saveConfigPage(); });
  server_.on("/config/test", HTTP_POST, [this]()
             { testMqttConnection(); });
  server_.on("/wifi-config", HTTP_GET, [this]()
             { showWiFiConfigPage(); });
  server_.on("/reset", HTTP_GET, [this]()
             { showResetPage(); });
  server_.on("/password", HTTP_GET, [this]()
             { showPasswordPage(); });
  server_.on("/password", HTTP_POST, [this]()
             { savePasswordPage(); });
  server_.on("/factory-reset", HTTP_GET, [this]()
             { showFactoryResetPage(); });
  server_.on("/factory-reset", HTTP_POST, [this]()
             { restoreFactorySettings(); });
  server_.on("/wifi", HTTP_POST, [this]()
             {if(!provisioning_&&!authenticated())return;startWiFiSetup(); });
  server_.on("/wifi/save", HTTP_POST, [this]()
             { saveWiFiSetupPage(); });
  server_.on("/update", HTTP_GET, [this]()
             { showUpdatePage(); });
  server_.on("/update", HTTP_POST, [this]()
             {if(!authenticated())return;if(firmwareUploadComplete_&&!firmwareUploadFailed_){server_.send(200,"text/plain","Update accepted. The controller will restart now with both relays locked off.");scheduleRestart();}else{outputs_.setSafetyLockout(true);server_.send(400,"text/plain","Update failed. Both relays remain locked off; restart the controller before trying again.");} }, [this]()
             { handleFirmwareUpload(); });
  server_.on("/logs", HTTP_GET, [this]()
             { showLogsPage(); });
  server_.on("/logs/data", HTTP_GET, [this]()
             { sendLogsJson(); });
  server_.on("/assets/controller.css", HTTP_GET, [this]()
             {server_.sendHeader("Cache-Control","public, max-age=86400");server_.send(200,"text/css",CONTROLLER_CSS); });
  server_.on("/assets/controller.js", HTTP_GET, [this]()
             {server_.sendHeader("Cache-Control","public, max-age=86400");server_.send(200,"application/javascript",CONTROLLER_JS); });
  server_.onNotFound([this]()
                     {if(provisioning_)sendCaptiveRedirect();else server_.send(404,"text/plain","Not found"); });
  server_.begin();
}
void ConfigWebServer::tick()
{
  server_.handleClient();
  if (restartPending_ && (long)(millis() - restartAt_) >= 0)
  {
    outputs_.turnAllOff();
    delay(20);
    rp2040.reboot();
  }
  if (connectAfterSetupPage_ && (long)(millis() - connectAfterSetupAt_) >= 0)
  {
    connectAfterSetupPage_ = false;
    connectSavedWiFi();
    return;
  }
  if (provisioning_)
  {
    if (!accessPointStarted_ && millis() - lastAccessPointAttemptAt_ >= 1000UL)
      startAccessPoint();
    if (accessPointStarted_)
      handleCaptiveDns();
    return;
  }
  if (!wifiConnectionPending_)
    return;
  if (WiFi.status() == WL_CONNECTED)
  {
    wifiConnectionPending_ = false;
    log("Wi-Fi connected; router assigned an address.");
    return;
  }
  const unsigned long now = millis();
  if (now - wifiConnectionStartedAt_ >= WIFI_CONNECT_TIMEOUT_MS)
  {
    log("Saved Wi-Fi did not connect within 60 seconds; opening setup network.");
    WiFi.disconnect();
    startWiFiSetup();
    return;
  }
  if (wifiAttemptStartedAt_ && now - wifiAttemptStartedAt_ >= WIFI_ATTEMPT_TIMEOUT_MS)
  {
    WiFi.disconnect();
    wifiAttemptStartedAt_ = 0;
    nextWiFiAttemptAt_ = now + WIFI_RETRY_INTERVAL_MS;
    log("Wi-Fi connection attempt timed out; waiting 5 seconds before retrying.");
    return;
  }
  if (!wifiAttemptStartedAt_ && (long)(now - nextWiFiAttemptAt_) >= 0)
  {
    WiFi.setHostname(config_.networkHostname);
    WiFi.begin(config_.wifiSsid, config_.wifiPassword);
    wifiAttemptStartedAt_ = now;
    log("Joining saved Wi-Fi network; allowing 30 seconds for connection and address.");
  }
}
bool ConfigWebServer::takeMqttRestartRequest()
{
  bool r = mqttRestartRequested_;
  mqttRestartRequested_ = false;
  return r;
}
bool ConfigWebServer::takeWiFiReconfigureRequest()
{
  bool r = wifiReconfigureRequested_;
  wifiReconfigureRequested_ = false;
  return r;
}
bool ConfigWebServer::wifiConfigured() const { return config_.wifiSsid[0] != '\0'; }
uint8_t ConfigWebServer::wifiIndicatorState() const
{
  if (provisioning_)
    return accessPointStarted_ ? 1 : 2;
  return WiFi.status() == WL_CONNECTED ? 3 : 0;
}
void ConfigWebServer::connectSavedWiFi()
{
  if (!wifiConfigured())
  {
    startWiFiSetup();
    return;
  }
  log("Trying saved Wi-Fi network.");
  outputs_.turnAllOff();
  provisioning_ = false;
  accessPointStarted_ = false;
  dnsServer_.stop();
  WiFi.end();
  WiFi.mode(WIFI_STA);
  WiFi.setHostname(config_.networkHostname);
  wifiConnectionStartedAt_ = millis();
  wifiAttemptStartedAt_ = 0;
  nextWiFiAttemptAt_ = wifiConnectionStartedAt_;
  wifiConnectionPending_ = true;
}
void ConfigWebServer::startWiFiSetup()
{
  // The router-facing name is deliberately fixed to this physical controller's
  // FTSs identity rather than being another editable setting.
  copyText(config_.networkHostname, sizeof(config_.networkHostname), defaultNetworkHostname().c_str());
  log("Starting open Wi-Fi setup network.");
  outputs_.turnAllOff();
  wifiConnectionPending_ = false;
  wifiAttemptStartedAt_ = 0;
  connectAfterSetupPage_ = false;
  provisioning_ = true;
  accessPointStarted_ = false;
  dnsServer_.stop();
  WiFi.disconnect();
  WiFi.end();
  WiFi.mode(WIFI_AP);
  lastAccessPointAttemptAt_ = millis() - 1000UL;
}
void ConfigWebServer::startAccessPoint()
{
  lastAccessPointAttemptAt_ = millis();
  const String ssid = apName();
  accessPointStarted_ = WiFi.beginAP(ssid.c_str());
  if (accessPointStarted_)
  {
    dnsServer_.begin(53);
    log("Setup network ready at http://192.168.4.1/");
  }
  else
    log("Setup network start failed; retrying.");
}
bool ConfigWebServer::applyStationHostname(const String &hostname)
{
  if (!hostname.length() || hostname.length() > 32 || hostname[0] == '-' || hostname[hostname.length() - 1] == '-')
    return false;
  for (size_t i = 0; i < hostname.length(); ++i)
  {
    const char c = hostname[i];
    if (!((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '-'))
      return false;
  }
  copyText(config_.networkHostname, sizeof(config_.networkHostname), hostname.c_str());
  return true;
}
bool ConfigWebServer::authenticated()
{
  if (server_.authenticate(CONFIG_USER, config_.webPassword))
    return true;
  server_.requestAuthentication();
  return false;
}
void ConfigWebServer::showDashboard()
{
  if (!authenticated())
    return;
  String p = pageStart("Controller overview");
  appendConfigTabs(p, "overview");
  p += F("<section class='card'><h1>System summary</h1><p>The heater and pump are interlocked: only one can run at a time.</p><div class='group'><h2>Device identity</h2><div class='grid'><div class='stat'><small>Controller identifier</small><strong>");
  appendEscaped(p, deviceName().c_str());
  p += F("</strong></div></div></div><div class='group'><h2>Temperature</h2><div class='grid'><div class='stat'><small>Probe reading</small><strong id='temperature' class='off'>Loading…</strong></div></div></div><div class='group'><h2>Outputs</h2><div class='grid'><div class='stat'><small>Heater relay</small><strong id='heater'>Loading…</strong></div><div class='stat'><small>Pump relay</small><strong id='pump'>Loading…</strong></div></div></div><div class='group'><h2>Connections</h2><div class='grid'><div class='stat'><small>Wi-Fi</small><strong id='wifi'>Loading…</strong></div><div class='stat'><small>Wi-Fi network</small><strong id='ssid' class='off'>Loading…</strong></div><div class='stat'><small>MQTT</small><strong id='mqtt'>Loading…</strong></div><div class='stat'><small>Address</small><strong id='address'>Loading…</strong></div></div></div></section></main></body></html>");
  server_.send(200, "text/html", p);
}
void ConfigWebServer::sendStatusJson()
{
  if (!authenticated())
    return;
  float c;
  const bool sensor = temperature_.readCelsius(c), wifi = WiFi.status() == WL_CONNECTED;
  String r = F("{\"temperature\":\"");
  if (sensor)
  {
    r += String(c, 1);
    r += " °C";
  }
  else
    r += "Sensor not found";
  r += F("\",\"sensorOk\":");
  r += sensor ? "true" : "false";
  r += F(",\"heater\":");
  r += outputs_.heaterEnabled() ? "true" : "false";
  r += F(",\"pump\":");
  r += outputs_.pumpEnabled() ? "true" : "false";
  r += F(",\"wifi\":");
  r += wifi ? "true" : "false";
  r += F(",\"ssid\":\"");
  if (wifi)
    r += WiFi.SSID();
  else
    r += "Not connected";
  r += F("\",\"mqtt\":");
  r += mqtt_.connected() ? "true" : "false";
  r += F(",\"deviceId\":\"");
  r += deviceName();
  r += F("\",\"address\":\"");
  if (wifi)
    r += WiFi.localIP().toString();
  else
    r += "Not connected";
  r += F("\"}");
  server_.send(200, "application/json", r);
}
void ConfigWebServer::appendConfigTabs(String &p, const char *a)
{
  p += F("<nav class='tabs' aria-label='Controller pages'><a class='tab ");
  p += strcmp(a, "overview") == 0 ? "active" : "";
  p += F("' href='/'>Overview</a><a class='tab ");
  p += strcmp(a, "wifi") == 0 ? "active" : "";
  p += F("' href='/wifi-config'>Wi-Fi</a><a class='tab ");
  p += strcmp(a, "mqtt") == 0 ? "active" : "";
  p += F("' href='/config'>MQTT</a><a class='tab ");
  p += strcmp(a, "update") == 0 ? "active" : "";
  p += F("' href='/update'>Update</a><a class='tab ");
  p += strcmp(a, "logs") == 0 ? "active" : "";
  p += F("' href='/logs'>Logs</a><a class='tab ");
  p += strcmp(a, "reset") == 0 ? "active" : "";
  p += F("' href='/reset'>Reset</a></nav>");
}
void ConfigWebServer::showConfigPage()
{
  if (!authenticated())
    return;
  String p = pageStart("MQTT and OTA-BP configuration");
  appendConfigTabs(p, "mqtt");
  p += F("<section class='card'><h1>MQTT connection</h1><p>Set where this controller sends status and receives commands.</p><form id='mqtt-settings-form' method='post' action='/config'><label>Broker address</label><input id='mqtt-host' name='host' maxlength='63' required value='");
  appendEscaped(p, config_.host);
  p += F("'><label>Broker port</label><input id='mqtt-port' name='port' type='number' min='1' max='65535' required value='");
  p += String(config_.port);
  p += F("'><label>Broker username</label><input id='mqtt-username' name='mqttUsername' maxlength='64' autocomplete='username' required value='");
  appendEscaped(p, config_.mqttUsername);
  p += F("'><label>Broker password</label><input id='mqtt-password' name='mqttPassword' type='password' maxlength='64' autocomplete='current-password' required value='");
  appendEscaped(p, config_.mqttPassword);
  p += F("'><input name='otaBpSensorId' type='hidden' value='");
  appendEscaped(p, config_.otaBpSensorId);
  p += F("'><input name='heaterActorId' type='hidden' value='");
  appendEscaped(p, config_.heaterActorId);
  p += F("'><input name='coolerActorId' type='hidden' value='");
  appendEscaped(p, config_.coolerActorId);
  p += F("'><button>Save MQTT settings</button></form><form id='mqtt-test-form' method='post' action='/config/test'><button id='mqtt-test-button' class='secondary' type='submit'>Test entered MQTT connection</button></form><p id='mqtt-test-result' class='notice' aria-live='polite'>Enter the broker address, port, username, and password above, then test them without saving. The controller only publishes to platform/test-connection and never listens for commands during this test.</p></section><section class='card'><h1>OTA-BP onboarding</h1><p>Your fixed controller identifier is <strong>");
  appendEscaped(p, deviceName().c_str());
  p += F("</strong>. The MQTT username is automatically used as the OTA-BP device ID. Enter the OTA-BP sensor ID and optional actor IDs assigned by the main app.</p><form method='post' action='/config'><input name='host' type='hidden' value='");
  appendEscaped(p, config_.host);
  p += F("'><input name='port' type='hidden' value='");
  p += String(config_.port);
  p += F("'><input name='mqttUsername' type='hidden' value='");
  appendEscaped(p, config_.mqttUsername);
  p += F("'><input name='mqttPassword' type='hidden' value='");
  appendEscaped(p, config_.mqttPassword);
  p += F("'><p>OTA-BP device ID: <strong>");
  appendEscaped(p, config_.mqttUsername);
  p += F("</strong> <span>(uses the broker username)</span></p><label>OTA-BP sensor ID</label><input name='otaBpSensorId' maxlength='64' value='");
  appendEscaped(p, config_.otaBpSensorId);
  p += F("' placeholder='Assigned sensor ID'><label>Heater actor ID</label><input name='heaterActorId' maxlength='64' value='");
  appendEscaped(p, config_.heaterActorId);
  p += F("' placeholder='Assigned heater actor ID'><label>Cooler actor ID</label><input name='coolerActorId' maxlength='64' value='");
  appendEscaped(p, config_.coolerActorId);
  p += F("' placeholder='Assigned cooler actor ID'><button>Save OTA-BP and actor identifiers</button></form></section><script>(()=>{const form=document.getElementById('mqtt-test-form'),button=document.getElementById('mqtt-test-button'),result=document.getElementById('mqtt-test-result');form.onsubmit=async e=>{e.preventDefault();const settings=document.getElementById('mqtt-settings-form');if(!settings.reportValidity())return;button.disabled=true;result.textContent='Testing the entered MQTT connection without saving…';try{const data=new URLSearchParams(new FormData(settings));const r=await fetch('/config/test',{method:'POST',body:data,cache:'no-store'});result.textContent=await r.text();}catch(e){result.textContent='The test could not reach the controller. Reload the page and try again.';}finally{button.disabled=false;}};})();</script></main></body></html>");
  server_.send(200, "text/html", p);
}
void ConfigWebServer::testMqttConnection()
{
  if (!authenticated())
    return;
  const String host = server_.arg("host");
  const long enteredPort = server_.arg("port").toInt();
  const String username = server_.arg("mqttUsername");
  const String password = server_.arg("mqttPassword");
  if (!host.length() || enteredPort < 1 || enteredPort > 65535 || !username.length() || !password.length())
  {
    server_.send(400, "text/plain", "Enter a broker address, port, username, and password before testing.");
    return;
  }
  outputs_.turnAllOff();
  const String result = mqtt_.testConnection(host.c_str(), static_cast<uint16_t>(enteredPort), username.c_str(), password.c_str());
  const bool success = mqtt_.lastTestSucceeded();
  log(success ? "MQTT connection test succeeded." : "MQTT connection test failed.");
  server_.send(success ? 200 : 400, "text/plain", result);
}
void ConfigWebServer::showWiFiConfigPage()
{
  if (!authenticated())
    return;
  String p = pageStart("Wi-Fi configuration");
  appendConfigTabs(p, "wifi");
  p += F("<section class='card'><h1>Router device name</h1><p>Your router name is fixed to this controller’s unique identity: <strong>");
  appendEscaped(p, deviceName().c_str());
  p += F("</strong>. Compatible routers use it to identify this controller in their connected-device list.</p></section><section class='card'><h1>Change Wi-Fi</h1><p>Start the open setup network <strong>");
  p += apName();
  p += F("</strong>, then connect your phone or computer to it and enter the new Wi-Fi name and password. Both relays turn off before the setup network starts. Saving new details switches networks without restarting the controller, and MQTT is not needed for this step.</p><form method='post' action='/wifi'><button type='submit'>Change Wi-Fi details</button></form></section></main></body></html>");
  server_.send(200, "text/html", p);
}
void ConfigWebServer::showUpdatePage()
{
  if (!authenticated())
    return;
  String p = pageStart("Firmware update");
  appendConfigTabs(p, "update");
  p += F("<section class='card'><h1>Firmware update</h1><p>Install the controller’s <strong>OTA firmware BIN file</strong>. A <strong>.uf2</strong> file is only for USB BOOTSEL recovery and is rejected here.</p><form id='update-form' action='/update' method='post' enctype='multipart/form-data'><label for='firmware'>Firmware BIN file</label><input id='firmware' name='firmware' type='file' accept='.bin,application/octet-stream' required><button id='update-button' type='submit'>Install update</button></form><div id='update-progress' class='progress-wrap'><div class='progress-track'><div id='update-bar' class='progress-bar'></div></div><p id='update-label' class='progress-label'>Preparing update…</p></div><p id='update-result' class='notice' aria-live='polite'>Both relays are switched off and locked for the complete update. Do not remove controller power while an update is being installed.</p><p>Choose the OTA <strong>.bin</strong> artifact Schematik produces for this exact controller build. The matching <strong>.uf2</strong> remains an emergency USB BOOTSEL recovery route only.</p><p>After a successful upload, wait for the controller to restart before opening another tab. An interrupted or rejected update deliberately leaves both relays locked off until restart.</p></section><script>(()=>{const form=document.getElementById('update-form'),file=document.getElementById('firmware'),button=document.getElementById('update-button'),wrap=document.getElementById('update-progress'),bar=document.getElementById('update-bar'),label=document.getElementById('update-label'),result=document.getElementById('update-result');form.onsubmit=e=>{e.preventDefault();const f=file.files[0];if(!f||!/\\.bin$/i.test(f.name)){result.textContent='Choose the OTA firmware BIN file. USB UF2 files cannot be installed from this page.';return;}button.disabled=true;file.disabled=true;wrap.classList.add('visible');result.textContent='Starting safe update; both relays are locked off.';const x=new XMLHttpRequest(),data=new FormData();data.append('firmware',f);x.open('POST','/update');x.setRequestHeader('X-Firmware-Size',String(f.size));x.timeout=300000;x.upload.onprogress=v=>{if(v.lengthComputable){const n=Math.round(v.loaded*100/v.total);bar.style.width=n+'%';label.textContent='Uploading '+n+'%';}};x.onload=()=>{result.textContent=x.responseText||'Update response received.';if(x.status===200){bar.style.width='100%';label.textContent='Update accepted; restarting…';}else{label.textContent='Update failed; restart the controller before another attempt.';}};x.onerror=()=>{result.textContent='The update connection was interrupted. Both relays remain locked off; restart the controller before another attempt.';label.textContent='Update interrupted.';};x.ontimeout=()=>{result.textContent='The update took too long. Both relays remain locked off; restart the controller before another attempt.';label.textContent='Update timed out.';};x.send(data);};})();</script></main></body></html>");
  server_.send(200, "text/html", p);
}
void ConfigWebServer::showLogsPage()
{
  if (!authenticated())
    return;
  String p = pageStart("Device logs");
  appendConfigTabs(p, "logs");
  p += F("<section class='card'><h1>Recent device logs</h1><p>This list shows recent controller events since the last restart. It is kept in memory, so it does not write to or wear out the device flash memory.</p><div id='logs' class='notice' aria-live='polite'>Loading logs…</div><button id='refresh-logs' class='secondary' type='button'>Refresh logs</button></section><script>(()=>{const box=document.getElementById('logs'),button=document.getElementById('refresh-logs');let busy=false;async function load(){if(busy)return;busy=true;button.disabled=true;button.textContent='Refreshing…';box.textContent='Refreshing logs…';try{const r=await fetch('/logs/data?now='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;const d=await r.json();box.textContent=d.length?d.join('\\n'):'No events recorded since startup.';}catch(e){box.textContent='Logs are unavailable. Reload this page after checking that you are still connected to the controller.';}finally{busy=false;button.disabled=false;button.textContent='Refresh logs';}}button.onclick=load;load();setInterval(load,2000);})();</script></main></body></html>");
  server_.send(200, "text/html", p);
}
void ConfigWebServer::sendLogsJson()
{
  if (!authenticated())
    return;
  String r = "[";
  for (uint8_t i = 0; i < logCount_; ++i)
  {
    if (i)
      r += ',';
    String line = logLines_[(logFirst_ + i) % MAX_LOG_LINES];
    r += '\"';
    for (size_t j = 0; j < line.length(); ++j)
    {
      char c = line[j];
      if (c == '\"' || c == '\\')
        r += '\\';
      if (c == '\n')
        r += F("\\n");
      else
        r += c;
    }
    r += '\"';
  }
  r += ']';
  server_.send(200, "application/json", r);
}
void ConfigWebServer::log(const char *message)
{
  const unsigned long totalSeconds = millis() / 1000UL;
  const unsigned long hours = totalSeconds / 3600UL;
  const unsigned long minutes = (totalSeconds / 60UL) % 60UL;
  const unsigned long seconds = totalSeconds % 60UL;
  char timestamp[16];
  snprintf(timestamp, sizeof(timestamp), "[%02lu:%02lu:%02lu]", hours, minutes, seconds);
  String line = String(timestamp) + F(" ") + message;
  Serial.println(line);
  if (logCount_ < MAX_LOG_LINES)
  {
    logLines_[(logFirst_ + logCount_) % MAX_LOG_LINES] = line;
    ++logCount_;
  }
  else
  {
    logLines_[logFirst_] = line;
    logFirst_ = (logFirst_ + 1) % MAX_LOG_LINES;
  }
}
void ConfigWebServer::showResetPage()
{
  if (!authenticated())
    return;
  String p = pageStart("Reset and password");
  appendConfigTabs(p, "reset");
  p += F("<section class='card'><h1>Dashboard password</h1><p>Change the password used to open this dashboard.</p><a class='button secondary' href='/password'>Change password</a></section><section class='card'><h1>Restore factory settings</h1><p>This removes saved Wi-Fi, MQTT, and dashboard-password details.</p><a class='button danger' href='/factory-reset'>Restore factory settings</a></section></main></body></html>");
  server_.send(200, "text/html", p);
}
void ConfigWebServer::saveConfigPage()
{
  if (!authenticated())
    return;
  String h = server_.arg("host");
  String username = server_.arg("mqttUsername");
  String password = server_.arg("mqttPassword");
  long port = server_.arg("port").toInt();
  if (!h.length() || port < 1 || port > 65535 || !username.length() || !password.length())
  {
    server_.send(400, "text/plain", "Enter a broker address, port, username, and password.");
    return;
  }
  copyText(config_.host, sizeof(config_.host), h.c_str());
  config_.port = port;
  copyText(config_.mqttUsername, sizeof(config_.mqttUsername), username.c_str());
  copyText(config_.mqttPassword, sizeof(config_.mqttPassword), password.c_str());
  copyText(config_.otaBpDeviceId, sizeof(config_.otaBpDeviceId), username.c_str());
  copyText(config_.otaBpSensorId, sizeof(config_.otaBpSensorId), server_.arg("otaBpSensorId").c_str());
  copyText(config_.heaterActorId, sizeof(config_.heaterActorId), server_.arg("heaterActorId").c_str());
  copyText(config_.coolerActorId, sizeof(config_.coolerActorId), server_.arg("coolerActorId").c_str());
  if (!saveConfig(config_))
  {
    outputs_.turnAllOff();
    log("Configuration could not be verified in storage.");
    server_.send(500, "text/plain", "The settings were not verified in storage. They were not applied; try saving again.");
    return;
  }
  outputs_.turnAllOff();
  sendRestartPage("Configuration saved", "Both relays are off and the controller is restarting.");
  scheduleRestart();
}
void ConfigWebServer::showPasswordPage()
{
  if (!authenticated())
    return;
  String p = pageStart("Password");
  appendConfigTabs(p, "reset");
  p += F("<section class='card'><h1>Change dashboard password</h1><form method='post' action='/password'><label>Current password</label><input name='current' type='password' required><label>New password</label><input name='newPassword' type='password' minlength='8' required><label>Repeat new password</label><input name='confirm' type='password' minlength='8' required><button>Save password</button></form></section></main></body></html>");
  server_.send(200, "text/html", p);
}
void ConfigWebServer::savePasswordPage()
{
  if (!authenticated())
    return;
  String n = server_.arg("newPassword");
  if (server_.arg("current") != config_.webPassword || n.length() < 8 || n != server_.arg("confirm"))
  {
    server_.send(400, "text/plain", "Use the current password and matching new passwords of at least 8 characters.");
    return;
  }
  copyText(config_.webPassword, sizeof(config_.webPassword), n.c_str());
  if (!saveConfig(config_))
  {
    server_.send(500, "text/plain", "The new password was not verified in storage. The old password is still active.");
    return;
  }
  server_.sendHeader("Location", "/reset");
  server_.send(303);
}
void ConfigWebServer::showFactoryResetPage()
{
  if (!authenticated())
    return;
  String p = pageStart("Factory reset");
  appendConfigTabs(p, "reset");
  p += F("<section class='card'><h1>Restore factory settings</h1><p>This removes saved Wi-Fi, MQTT, and dashboard-password details.</p><form method='post' action='/factory-reset'><label>Type RESET to confirm</label><input name='confirm' maxlength='5' required><button class='danger'>Erase settings and restart</button></form></section></main></body></html>");
  server_.send(200, "text/html", p);
}
void ConfigWebServer::restoreFactorySettings()
{
  if (!authenticated())
    return;
  if (server_.arg("confirm") != "RESET")
  {
    server_.send(400, "text/plain", "Type RESET exactly.");
    return;
  }
  outputs_.turnAllOff();
  restoreFactoryConfig(config_);
  sendRestartPage("Factory settings restored", "Both relays are off. After restart, join the open setup network.");
  scheduleRestart();
}
String ConfigWebServer::deviceName() const { return controllerDeviceName(); }
void ConfigWebServer::showWiFiSetupPage()
{
  String p = pageStart("Wi-Fi setup");
  p += F("<section class='card'><h1>Connect to your Wi-Fi</h1><p>This is the open setup network. Both relays are off while setup is active. Your router will identify this controller as <strong>");
  appendEscaped(p, deviceName().c_str());
  p += F("</strong>.</p><form method='post' action='/wifi/save'><label>Wi-Fi network name</label><input name='ssid' maxlength='32' required placeholder='Enter your Wi-Fi name'><label>Wi-Fi password</label><input name='password' type='password' maxlength='64' placeholder='Leave blank only if your Wi-Fi has no password'><button>Save and connect</button></form></section></main></body></html>");
  server_.send(200, "text/html", p);
}
void ConfigWebServer::saveWiFiSetupPage()
{
  String s = server_.arg("ssid");
  if (!s.length())
  {
    server_.send(400, "text/plain", "Enter a Wi-Fi network name.");
    return;
  }
  copyText(config_.networkHostname, sizeof(config_.networkHostname), defaultNetworkHostname().c_str());
  copyText(config_.wifiSsid, sizeof(config_.wifiSsid), s.c_str());
  copyText(config_.wifiPassword, sizeof(config_.wifiPassword), server_.arg("password").c_str());
  if (!saveConfig(config_))
  {
    outputs_.turnAllOff();
    log("Wi-Fi settings could not be verified in storage.");
    server_.send(500, "text/plain", "The Wi-Fi details were not verified in storage. They have not been used; keep this page open and try saving again.");
    return;
  }
  log("New Wi-Fi settings saved and verified; changing network.");
  outputs_.turnAllOff();
  mqttRestartRequested_ = true;
  sendRestartPage("Wi-Fi settings saved", "Both relays are off. Close this page and reconnect your phone to its normal Wi-Fi. This setup network will shut down while the controller makes a fresh connection; it does not restart.");
  connectAfterSetupAt_ = millis() + 1500UL;
  connectAfterSetupPage_ = true;
}
void ConfigWebServer::resetFirmwareUploadState()
{
  firmwareUploadFailed_ = false;
  firmwareUploadComplete_ = false;
  firmwareUploadStarted_ = false;
  declaredFirmwareBytes_ = 0;
  receivedFirmwareBytes_ = 0;
  if (stagedFirmwareFile_)
    stagedFirmwareFile_.close();
  LittleFS.remove("update.bin");
  LittleFS.remove("otacommand.bin");
}
void ConfigWebServer::handleFirmwareUpload()
{
  if (!authenticated())
    return;
  HTTPUpload &upload = server_.upload();
  if (upload.status == UPLOAD_FILE_START)
  {
    resetFirmwareUploadState();
    outputs_.setSafetyLockout(true);
    declaredFirmwareBytes_ = static_cast<size_t>(server_.header("X-Firmware-Size").toInt());
    const String name = upload.filename; // Arduino-Pico's LittleFS FS interface has no totalBytes()/usedBytes().
    // Opening and writing the staged file is the compatible capacity check: a
    // short write is treated as an update failure and preserves the lockout.
    if (declaredFirmwareBytes_ == 0 || !name.endsWith(".bin") || !LittleFS.begin())
    {
      firmwareUploadFailed_ = true;
      log("OTA BIN upload was rejected before staging.");
    }
    else
    {
      stagedFirmwareFile_ = LittleFS.open("update.bin", "w");
      if (!stagedFirmwareFile_)
      {
        firmwareUploadFailed_ = true;
        log("OTA BIN staging file could not open.");
      }
      else
      {
        firmwareUploadStarted_ = true;
        log("OTA BIN upload started; outputs locked off.");
      }
    }
  }
  else if (upload.status == UPLOAD_FILE_WRITE)
  {
    if (!firmwareUploadFailed_ && firmwareUploadStarted_)
    {
      const size_t written = stagedFirmwareFile_.write(upload.buf, upload.currentSize);
      receivedFirmwareBytes_ += written;
      if (written != upload.currentSize)
      {
        firmwareUploadFailed_ = true;
        log("OTA BIN staging write failed.");
      }
    }
  }
  else if (upload.status == UPLOAD_FILE_END)
  {
    if (stagedFirmwareFile_)
      stagedFirmwareFile_.close();
    if (!firmwareUploadFailed_ && firmwareUploadStarted_ && receivedFirmwareBytes_ == declaredFirmwareBytes_)
    {
      picoOTA.begin();
      // PicoOTA records a checksummed command pointing to this LittleFS file.
      // On restart its bootloader verifies and copies the image, so the running
      // controller firmware is never overwritten in place.
      picoOTA.addFile("update.bin");
      picoOTA.commit();
      LittleFS.end();
      firmwareUploadComplete_ = true;
      log("OTA BIN staged for bootloader verification at restart.");
    }
    else
    {
      firmwareUploadFailed_ = true;
      log("OTA BIN upload size check failed.");
    }
  }
  else if (upload.status == UPLOAD_FILE_ABORTED)
  {
    if (stagedFirmwareFile_)
      stagedFirmwareFile_.close();
    firmwareUploadFailed_ = true;
    log("OTA BIN upload cancelled.");
  }
}
void ConfigWebServer::scheduleRestart()
{
  restartAt_ = millis() + 1500UL;
  restartPending_ = true;
}
void ConfigWebServer::sendRestartPage(const char *t, const char *m)
{
  String p = pageStart(t);
  p += F("<section class='card'><h1>");
  p += t;
  p += F("</h1><p>");
  p += m;
  p += F("</p><div class='restart-wait' role='status' aria-live='polite'><span class='spinner' aria-hidden='true'></span><p><strong id='restart-state'>Waiting for the controller…</strong><span id='restart-detail'>It will return home automatically when the controller is ready.</span></p></div></section><script>(()=>{const state=document.getElementById('restart-state'),detail=document.getElementById('restart-detail');let attempts=0;const check=async()=>{attempts++;try{const r=await fetch('/status?ready='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;await r.json();state.textContent='Controller is ready.';detail.textContent='Opening the dashboard…';location.replace('/');}catch(e){if(attempts>3){state.textContent='Still waiting for the controller…';detail.textContent='Keep this page open. If you changed Wi-Fi, reconnect this phone or computer to your normal Wi-Fi first.';}setTimeout(check,1000);}};setTimeout(check,2200);})();</script></main></body></html>");
  server_.send(200, "text/html", p);
}
void ConfigWebServer::handleCaptiveDns()
{
  int n = dnsServer_.parsePacket();
  if (n <= 0)
    return;
  uint8_t q[256], a[512];
  int len = dnsServer_.read(q, sizeof(q));
  if (len < 12)
    return;
  memcpy(a, q, 2);
  a[2] = 0x81;
  a[3] = 0x80;
  a[4] = q[4];
  a[5] = q[5];
  a[6] = 0;
  a[7] = 1;
  a[8] = a[9] = a[10] = a[11] = 0;
  int end = 12;
  while (end < len && q[end])
    end += q[end] + 1;
  end += 5;
  if (end > len || end + 16 > (int)sizeof(a))
    return;
  memcpy(a + 12, q + 12, end - 12);
  int o = end;
  a[o++] = 0xc0;
  a[o++] = 0x0c;
  a[o++] = 0;
  a[o++] = 1;
  a[o++] = 0;
  a[o++] = 1;
  a[o++] = 0;
  a[o++] = 0;
  a[o++] = 0;
  a[o++] = 60;
  a[o++] = 0;
  a[o++] = 4;
  a[o++] = 192;
  a[o++] = 168;
  a[o++] = 4;
  a[o++] = 1;
  dnsServer_.beginPacket(dnsServer_.remoteIP(), dnsServer_.remotePort());
  dnsServer_.write(a, o);
  dnsServer_.endPacket();
}
void ConfigWebServer::sendCaptiveRedirect()
{
  server_.sendHeader("Location", "http://192.168.4.1/");
  server_.send(302, "text/plain", "Redirecting to Wi-Fi setup");
}
