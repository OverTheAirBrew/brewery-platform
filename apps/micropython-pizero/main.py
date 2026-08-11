import asyncio

import network
import rp2
import socket
import json
import time
import machine
import onewire
import ds18x20

from umqtt import MQTTClient
from webserver import Webserver

CONFIG_FILE = "config.json"
rp2.country('GB')

dat_pin = machine.Pin(22)
ow = onewire.OneWire(dat_pin)
ds = ds18x20.DS18X20(ow)

roms = ds.scan()
print("Found DS devices:", roms)

raw_id = machine.unique_id()
hex_id = "".join("{:02X}".format(b) for b in raw_id)

def load_config():
    """Load configuration with default fallback fields."""
    try:
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    except OSError:
        return {
            "ssid": "",
            "password": "",
            "mqtt_host": "",
            "mqtt_user": "",
            "mqtt_pass": "",
            "sensor_id": "sensor-001"
        }

def save_config(data):
    """Save configuration dictionary to config.json."""
    with open(CONFIG_FILE, 'w') as f:
        json.dump(data, f)

def connect_to_wifi(ssid, password):
    """Attempt connection to home Wi-Fi."""
    if not ssid:
        return False
    
    print(f"Connecting to home Wi-Fi: {ssid}...")
    sta = network.WLAN(network.STA_IF)
    sta.active(True)
    sta.connect(ssid, password)
    
    for _ in range(12):
        if sta.isconnected():
            print(sta.ifconfig())
            print("Connected! IP Address:", sta.ifconfig()[0])
            return True
        time.sleep(1)
        
    print("Connection failed.")
    sta.active(False)
    return False

def start_access_point():
    """Start fallback Access Point if Wi-Fi fails."""
    sta = network.WLAN(network.STA_IF)
    sta.active(False)
    
    ap = network.WLAN(network.AP_IF)
    ap.active(False)
    time.sleep(0.5)
    
    ap.config(ssid="Pico-Setup", security=0)
    ap.active(True)
    
    while not ap.active():
        time.sleep(0.1)

    ap.ifconfig(('192.168.4.1', '255.255.255.0', '192.168.4.1', '192.168.4.1'))
    try:
        ap.config(pm=0xa11142)
    except Exception:
        pass
        
    ip = ap.ifconfig()[0]
    print(f"AP Online: 'Pico-Setup' | Portal IP: {ip}")
    return ip

def urldecode(text):
    """Decode form inputs (%20 to space, etc.)."""
    text = text.replace('+', ' ')
    res = ""
    i = 0
    while i < len(text):
        if text[i] == '%' and i + 2 < len(text):
            try:
                res += chr(int(text[i+1:i+3], 16))
                i += 3
            except ValueError:
                res += text[i]
                i += 1
        else:
            res += text[i]
            i += 1
    return res

def get_html_page(config, is_connected):
    """Generate HTML UI with URL-encoded form submission (best practice)."""
    wifi_hidden = "hidden" if is_connected else ""
    mqtt_hidden = "" if is_connected else "hidden"
    connecting_hidden = "hidden"

    logo_b64 = "data:image/png;base64,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"

    return f"""<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 90vh; }}
        .card {{ background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 360px; width: 100%; box-sizing: border-box; text-align: center; }}
        .logo {{ width: 80px; height: 80px; margin: 0 auto 12px auto; display: block; object-fit: contain; }}
        input {{ width: 100%; padding: 10px; margin: 4px 0 14px 0; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-size: 14px; }}
        button, input[type="submit"] {{ width: 100%; background: #0284c7; color: #fff; border: none; font-weight: 600; cursor: pointer; margin-top: 10px; padding: 12px; border-radius: 6px; font-size: 14px; }}
        button:hover, input[type="submit"]:hover {{ background: #0369a1; }}
        label {{ font-size: 12px; color: #555; display: block; text-align: left; font-weight: 600; }}
        h2 {{ margin-top: 0; color: #111; text-align: center; font-size: 20px; }}
        p {{ font-size: 13px; color: #666; text-align: center; line-height: 1.4; }}
        .hidden {{ display: none !important; }}
        .spinner {{ text-align: center; padding: 20px; font-weight: 600; color: #0284c7; }}
        .success-badge {{ background: #d1fae5; color: #065f46; padding: 10px; border-radius: 6px; font-size: 13px; margin-bottom: 14px; text-align: center; font-weight: 600; }}
    </style>
</head>
<body>
    <div class="card">
        <!-- Logo Image -->
        <img src="{logo_b64}" class="logo" alt="Device Logo">
        
        <h2>FTSs Setup ⚙️</h2>

        <!-- STEP 1: WIFI CONFIGURATION -->
        <div id="step-wifi" class="{wifi_hidden}">
            <p>Connect your device to your local Wi-Fi network to proceed.</p>
            <form id="wifi-form">
                <label>Wi-Fi SSID</label>
                <input type="text" id="ssid" name="ssid" value="{config.get('ssid', '')}" required placeholder="Network name">
                
                <label>Wi-Fi Password</label>
                <input type="password" id="password" name="password" value="{config.get('password', '')}" placeholder="Password">
                
                <button type="submit">Save & Connect</button>
            </form>
        </div>

        <!-- LOADING STATE -->
        <div id="step-connecting" class="{connecting_hidden}">
            <p>Attempting connection to Wi-Fi...</p>
            <div class="spinner">⟳ Checking status...</div>
        </div>

        <!-- STEP 2: MQTT & DEVICE CONFIGURATION -->
        <div id="step-mqtt" class="{mqtt_hidden}">
            <div class="success-badge">✓ Wi-Fi Connected Successfully!</div>
            <p>Configure your sensor details and MQTT broker.</p>
            <form id="mqtt-form">
                <label>Sensor ID</label>
                <input type="text" id="sensor_id" name="sensor_id" value="{config.get('sensor_id', 'sensor-001')}" required>
                
                <label>MQTT Host / IP</label>
                <input type="text" id="mqtt_host" name="mqtt_host" value="{config.get('mqtt_host', '')}" required placeholder="192.168.1.50">
                
                <label>MQTT Username (Optional)</label>
                <input type="text" id="mqtt_user" name="mqtt_user" value="{config.get('mqtt_user', '')}">
                
                <label>MQTT Password (Optional)</label>
                <input type="password" id="mqtt_pass" name="mqtt_pass" value="{config.get('mqtt_pass', '')}">
                
                <button type="submit">Complete Setup & Reboot</button>
            </form>
        </div>
    </div>

    <script>
        const wifiForm = document.getElementById('wifi-form');
        const mqttForm = document.getElementById('mqtt-form');
        const stepWifi = document.getElementById('step-wifi');
        const stepConnecting = document.getElementById('step-connecting');
        const stepMqtt = document.getElementById('step-mqtt');

        wifiForm.addEventListener('submit', async (e) => {{
            e.preventDefault();
            // URL-encoded best practice format using URLSearchParams
            const formData = new URLSearchParams(new FormData(wifiForm));
            
            stepWifi.classList.add('hidden');
            stepConnecting.classList.remove('hidden');

            try {{
                await fetch('/save-wifi', {{ 
                    method: 'POST', 
                    headers: {{ 'Content-Type': 'application/x-www-form-urlencoded' }},
                    body: formData 
                }});

                const pollInterval = setInterval(async () => {{
                    try {{
                        const res = await fetch('/status');
                        const data = await res.json();
                        if (data.connected) {{
                            clearInterval(pollInterval);
                            stepConnecting.classList.add('hidden');
                            stepMqtt.classList.remove('hidden');
                        }}
                    }} catch (err) {{}}
                }}, 2000);
            }} catch (err) {{
                alert('Failed to send Wi-Fi credentials.');
                stepConnecting.classList.add('hidden');
                stepWifi.classList.remove('hidden');
            }}
        }});

        mqttForm.addEventListener('submit', async (e) => {{
            e.preventDefault();
            const formData = new URLSearchParams(new FormData(mqttForm));
            
            await fetch('/save-mqtt', {{ 
                method: 'POST', 
                headers: {{ 'Content-Type': 'application/x-www-form-urlencoded' }},
                body: formData 
            }});
            document.body.innerHTML = "<div class='card'><img src='{logo_b64}' class='logo' alt='Device Logo'><h2>Setup Complete! 🎉</h2><p>Settings saved successfully. The device is restarting...</p></div>";
        }});
    </script>
</body>
</html>"""

def parse_http_request(conn):
    """Read and parse a single HTTP request from a socket.

    Reads the headers first, then uses Content-Length to make sure the
    complete request body has been received. Returns:
        method, path, headers, body
    """
    request = b""
    header_end = -1

    # TCP does not guarantee that the complete HTTP request arrives in one
    # recv() call, so keep reading until the HTTP headers are complete.
    while header_end == -1 and len(request) < 8192:
        chunk = conn.recv(512)
        if not chunk:
            break

        request += chunk
        header_end = request.find(b"\r\n\r\n")

    if header_end == -1:
        return "", "/", {}, b""

    header_bytes = request[:header_end]
    body = request[header_end + 4:]

    header_text = header_bytes.decode("utf-8", "ignore")
    lines = header_text.split("\r\n")

    if not lines:
        return "", "/", {}, b""

    # Request line: POST /save-wifi HTTP/1.1
    parts = lines[0].split(" ")
    method = parts[0] if len(parts) > 0 else ""
    path = parts[1] if len(parts) > 1 else "/"

    # Parse HTTP headers.
    headers = {}
    for line in lines[1:]:
        if ":" in line:
            key, value = line.split(":", 1)
            headers[key.strip().lower()] = value.strip()

    # Read the rest of the body using Content-Length.
    content_length = 0
    try:
        content_length = int(headers.get("content-length", "0"))
    except ValueError:
        content_length = 0

    while len(body) < content_length:
        remaining = content_length - len(body)
        chunk = conn.recv(min(512, remaining))

        if not chunk:
            break

        body += chunk

    # Ignore anything beyond Content-Length.
    body = body[:content_length]

    return method, path, headers, body


def parse_form_urlencoded(body):
    """Parse application/x-www-form-urlencoded request data."""
    if not body:
        return {}

    if isinstance(body, bytes):
        body = body.decode("utf-8", "ignore")

    parsed = {}

    for pair in body.split("&"):
        if "=" in pair:
            key, value = pair.split("=", 1)
        else:
            key, value = pair, ""

        key = urldecode(key)
        value = urldecode(value)
        parsed[key] = value

    return parsed


def send_response(conn, status, content_type, body):
    """Send a simple HTTP response."""
    if isinstance(body, str):
        body = body.encode("utf-8")

    response = (
        "HTTP/1.1 " + status + "\r\n"
        "Content-Type: " + content_type + "\r\n"
        "Content-Length: " + str(len(body)) + "\r\n"
        "Connection: close\r\n"
        "\r\n"
    ).encode("utf-8")

    conn.sendall(response + body)


def run_web_server(ip, enable_dns=False):
    """Run non-blocking Web Server (and optional Captive Portal DNS)."""
    dns_sock = None
       
    if enable_dns:
        dns_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        dns_sock.setblocking(False)
        dns_sock.bind(('0.0.0.0', 53))

    web_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    web_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    web_sock.bind(('0.0.0.0', 80))
    web_sock.listen(4)
    web_sock.setblocking(False)

    print(f"Web server running. Access via: http://{ip}/")

    while True:
        # 1. Handle DNS queries
        if dns_sock:
            try:
                data, addr = dns_sock.recvfrom(1024)
                
                print(f"DNS query received from {addr}: {data.hex()}")
                
                packet = (
                    data[:2]
                    + b'\x81\x80'
                    + data[4:6]
                    + data[4:6]
                    + b'\x00\x00\x00\x00'
                    + data[12:]
                )
                packet += (
                    b'\xc0\x0c\x00\x01\x00\x01\x00\x00\x00\x3c\x00\x04'
                    + bytes(map(int, ip.split('.')))
                )
                dns_sock.sendto(packet, addr)
            except OSError:
                pass

        # 2. Handle HTTP Web requests
        try:
            conn, addr = web_sock.accept()
            conn.settimeout(1.5)

            try:
                method, path, headers, body = parse_http_request(conn)

                if not method:
                    conn.close()
                    time.sleep(0.04)
                    continue

                body_str = body.decode('utf-8', 'ignore')
                config = load_config()

                print("HTTP request:", method, path)
                if body:
                    print("HTTP body:", body_str)

                # ---------------------------------------------------------
                # Save Wi-Fi configuration
                # ---------------------------------------------------------
                if path == '/save-wifi' and method == 'POST':
                    print("Received Wi-Fi credentials via POST.")
                    print("Content-Type:", headers.get('content-type', ''))
                    print("Content-Length:", headers.get('content-length', '0'))

                    parsed = parse_form_urlencoded(body)

                    print("Parsed form data:", parsed)

                    config['ssid'] = parsed.get('ssid', '')
                    config['password'] = parsed.get('password', '')
                    save_config(config)

                    print("SSID:", config['ssid'])
                    print("Password received:", bool(config['password']))

                    # Trigger background connection attempt
                    sta = network.WLAN(network.STA_IF)
                    sta.active(True)
                    sta.connect(config['ssid'], config['password'])

                    send_response(
                        conn,
                        "200 OK",
                        "application/json",
                        '{"status":"connecting"}'
                    )

                # ---------------------------------------------------------
                # Wi-Fi connection status
                # ---------------------------------------------------------
                elif path == '/status' and method == 'GET':
                    print("Status check requested.")

                    sta = network.WLAN(network.STA_IF)
                    is_conn = sta.isconnected()

                    send_response(
                        conn,
                        "200 OK",
                        "application/json",
                        '{"connected": ' + str(is_conn).lower() + '}'
                    )

                # ---------------------------------------------------------
                # Save MQTT configuration
                # ---------------------------------------------------------
                elif path == '/save-mqtt' and method == 'POST':
                    print("Received MQTT configuration via POST.")
                    print("Content-Type:", headers.get('content-type', ''))
                    print("Content-Length:", headers.get('content-length', '0'))

                    parsed = parse_form_urlencoded(body)

                    print("Parsed form data:", parsed)

                    config['mqtt_host'] = parsed.get('mqtt_host', '')
                    config['mqtt_user'] = parsed.get('mqtt_user', '')
                    config['mqtt_pass'] = parsed.get('mqtt_pass', '')
                    config['sensor_id'] = parsed.get('sensor_id', '')

                    save_config(config)

                    send_response(
                        conn,
                        "200 OK",
                        "application/json",
                        '{"status":"saved"}'
                    )

                    conn.close()
                    time.sleep(1.5)
                    machine.reset()
                    continue

                # ---------------------------------------------------------
                # Captive portal / main page
                # ---------------------------------------------------------
                else:
                    host = headers.get('host', '')

                    # Captive portal redirection check
                    if enable_dns and host.split(':')[0] != ip:
                        resp = (
                            "HTTP/1.1 302 Found\r\n"
                            "Location: http://" + ip + "/\r\n"
                            "Connection: close\r\n"
                            "\r\n"
                        )
                        conn.sendall(resp.encode('utf-8'))
                    else:
                        sta = network.WLAN(network.STA_IF)
                        is_connected = sta.isconnected()
                        html_page = get_html_page(config, is_connected)

                        send_response(
                            conn,
                            "200 OK",
                            "text/html; charset=utf-8",
                            html_page
                        )

            except OSError as e:
                print("HTTP socket error:", e)
            except Exception as e:
                print("HTTP request error:", e)

            try:
                conn.close()
            except OSError:
                pass

        except OSError:
            # No incoming connection / non-blocking socket timeout.
            pass

        time.sleep(0.04)


async def heartbeat_task(client: MQTTClient):
  while True:
    print("System alive... (doing other background work)")
    client.publish(f"heartbeat/{hex_id}", json.dumps({"status": "alive", "timestamp": time.time()}))
    await asyncio.sleep(10)  # Send heartbeat every 10 seconds
    
async def sensor_reader_task(client:MQTTClient=None):
  if not roms:
      print("No sensors available to read.")
      return
      
  while True:
      try:
          # Step 1: Trigger temperature conversion on the bus
          ds.convert_temp()
          
          # Step 2: Yield control back to the event loop for 750ms 
          # (Allows other tasks to run while the sensor calculates)
          await asyncio.sleep(0.75)
          
          # Step 3: Read and display values for each sensor
          for rom in roms:
              temp_c = ds.read_temp(rom)
              sensor_id = "".join("{:02X}".format(b) for b in rom)
              print(f"[Sensor {sensor_id}] Temperature: {temp_c:.2f} °C")
              client.publish(f"ftss/{hex_id}/sensor/{sensor_id}/reading", json.dumps({"value": temp_c}))
              
      except Exception as e:
          print(f"Error reading sensor: {e}")
          
      # Wait before the next reading cycle
      await asyncio.sleep(5)

# --- Execution ---
if __name__ == "__main__":
    cfg = load_config()
    
    
    # Try connecting to Wi-Fi first using stored credentials
    if connect_to_wifi(cfg.get('ssid', ''), cfg.get('password', '')):
        sta_ip = network.WLAN(network.STA_IF).ifconfig()[0]
        
        print(f"Configuration UI available at: http://{sta_ip}/")
        
        webServer = Webserver(sta_ip, enable_dns=False)
                        
        if cfg.get('mqtt_host') is not None:
          print(f"Device online! MQTT Host: {cfg.get('mqtt_host', 'None')}")
          client = MQTTClient("TESTING", cfg.get('mqtt_host', 'None'), port=1883, user=cfg.get("mqtt_user"), password=cfg.get("mqtt_pass"))
          
          try:
            client.connect()
            print("MQTT connection successful.")
            
            asyncio.create_task(heartbeat_task(client))
            asyncio.create_task(sensor_reader_task(client))
            
            client.publish("HELLO", b"Hello from authenticated MicroPython!")
          except Exception as e:
            print("MQTT connection failed:", e)
        
        # Run web server normally on home network
        #run_web_server(sta_ip, enable_dns=False)
        
        webServer.start();
        
        
        
          
    else:
        # Fallback to Access Point + Captive Portal + Progressive UI
        ap_ip = start_access_point()
        run_web_server(ap_ip, enable_dns=True)