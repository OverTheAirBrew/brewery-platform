import ubinascii
import machine

def device_id() -> str:
  mac = ubinascii.hexlify(machine.unique_id()).decode()
  return mac