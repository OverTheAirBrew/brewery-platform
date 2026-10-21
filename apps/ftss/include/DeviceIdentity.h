#pragma once

#include <Arduino.h>

// Returns a stable name such as FTSs-A1B2C3D4E5F6, derived from this Pico W's
// unique Wi-Fi hardware address. It is used by the web UI and MQTT client.
String controllerDeviceName();

// Returns a DHCP-safe default such as heater-controller-a1b2c3d4e5f6.
// This is the name a router can show for the controller.
String defaultNetworkHostname();
