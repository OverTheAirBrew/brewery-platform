import socket
from time import time

class Webserver:
  def __init__(self, ipAddress: str, port: int = 80, enable_dns: bool = False):
    self.enable_dns = enable_dns
    self.ipAddress = ipAddress
    self.port = port
    
    self.web_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    self.web_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    self.web_socket.setblocking(False)
    
    if(self.enable_dns):
      self.dns_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
      self.dns_socket.setblocking(False)
      
  def __parse_http_request(self, conn):
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


def __parse_form_urlencoded(self, body):
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

        key = self.__urldecode(key)
        value = self.__urldecode(value)
        parsed[key] = value

    return parsed
        
  def start(self):
    self.web_socket.bind(('0.0.0.0', self.port))
    self.web_socket.listen(4)
    
    if(self.enable_dns):
      self.dns_socket.bind(('0.0.0.0', 53))  
      
    while True:
      if self.enable_dns:
        try:
          data, addr = self.dns_socket.recvfrom(1024)
          
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
            + bytes(map(int, self.ipAddress.split('.')))
          )
          
          self.dns_socket.sendto(packet, addr)
        except OSError:
            pass
          
      try:
        conn, addr = self.web_socket.accept()
        conn.settimeout(1.5)

        try:
            method, path, headers, body = self.__parse_http_request(conn)

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


