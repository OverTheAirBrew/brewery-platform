import socket
import uasyncio as asyncio

_DNS_PORT = 53
_BUF_SIZE = 512

def _build_response(query: bytes, ip: str) -> bytes:
  tid = query[:2]
  response = bytearray()
  response += tid
  response += b'\x81\x80'  # Flags: Standard query response, No error
  response += b'\x00\x01'  # Questions: 1
  response += b'\x00\x01'  # Answer RRs: 1
  response += b'\x00\x00'  # Authority RRs: 0
  response += b'\x00\x00'  # Additional RRs: 0
  
  idx = 12
  while idx < len(query) and query[idx] != 0:
    length = query[idx]
    response += bytes([length])
    response += query[idx + 1:idx + 1 + length]
    idx += length + 1
  response += b'\x00'  # Null byte to terminate the domain name
  response += query[idx + 1:idx + 5]  # Type and Class from the query
  
  response += b'\xc0\x0c'  # Name: Pointer to the domain name in the query
  response += b'\x00\x01'  # Type: A (host address)
  response += b'\x00\x01'  # Class: IN (Internet)
  response += b'\x00\x00\x00\x3c'  # TTL: 60 seconds
  response += b'\x00\x04'  # Data length:
  response += bytes(int(part) for part in ip.split('.'))  # IP address
  
  return bytes(response)

class DNSServer:
  def __init__(self, redirect_ip:str):
    self._ip = redirect_ip
    self._running = False
    
  async def run(self):
    self._running = True
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(('0.0.0.0', _DNS_PORT))
    sock.setblocking(False)
    
    print(f"[DNS] DNS server started, redirecting to {self._ip}")
    
    while self._running:
      try:
        data, addr = sock.recvfrom(_BUF_SIZE)
        if data:
          response = _build_response(data, self._ip)
          sock.sendto(response, addr)
      except Exception as e:
        await asyncio.sleep_ms(100)
        
    sock.close()
    
  def stop(self):
    self._running = False