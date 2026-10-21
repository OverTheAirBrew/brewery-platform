#pragma once

#include <Arduino.h>

constexpr uint16_t DEFAULT_MQTT_PORT = 1883;
// The complete configuration record is about 662 bytes.  Keep a full 1 KiB
// EEPROM-emulation area so password and Wi-Fi fields are never truncated.
constexpr size_t EEPROM_BYTES = 1024;
constexpr uint32_t CONFIG_MAGIC = 0x48434F33;
constexpr uint16_t CONFIG_VERSION = 8;
constexpr char DEFAULT_WEB_PASSWORD[] = "password";

// This release performs one deliberate clean-start erase on its first boot.
// The marker lives at the end of EEPROM emulation, outside MqttConfig.
constexpr uint32_t CLEAN_DEFAULTS_RELEASE_MARKER = 0x46544357UL; // "FTCW"
constexpr size_t CLEAN_DEFAULTS_RELEASE_MARKER_OFFSET = EEPROM_BYTES - sizeof(uint32_t);

enum class ConfigLoadResult : uint8_t
{
  Valid,
  MigratedLegacy,
  EmptyOrInvalid
};

struct MqttConfig
{
  uint32_t magic;
  char host[64];
  uint16_t port;
  char mqttUsername[65];
  char mqttPassword[65];
  char wifiSsid[33];
  char wifiPassword[65];
  // DHCP hostname shown by compatible routers. It contains only letters,
  // numbers, and hyphens, and does not need to match the Wi-Fi network name.
  char networkHostname[33];
  char webPassword[65];
  char otaBpDeviceId[65];
  char otaBpSensorId[65];
  char heaterActorId[65];
  char coolerActorId[65];
  uint16_t version;
  uint32_t checksum;
};

void copyText(char *destination, size_t size, const char *source);
ConfigLoadResult loadConfig(MqttConfig &config);
bool saveConfig(MqttConfig &config);
void restoreFactoryConfig(MqttConfig &config);
// Returns true exactly once per device for this clean-defaults release.
// On that first call it erases the complete settings area and restores defaults.
bool applyCleanDefaultsRelease(MqttConfig &config);
const char *configLoadResultText(ConfigLoadResult result);
