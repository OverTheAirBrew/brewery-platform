#include "DeviceIdentity.h"

#include <WiFi.h>

namespace
{
  String macWithoutSeparators(bool uppercase)
  {
    String mac = WiFi.macAddress();
    mac.replace(":", "");
    if (uppercase)
      mac.toUpperCase();
    else
      mac.toLowerCase();
    return mac;
  }
}

String controllerDeviceName()
{
  return String("FTSs-") + macWithoutSeparators(true);
}

String defaultNetworkHostname()
{
  // Keep the DHCP name identical to the printed controller identity so the
  // same FTSs name appears on compatible routers and in the local dashboard.
  return controllerDeviceName();
}
