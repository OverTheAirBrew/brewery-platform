#include "AppConfig.h"
#include "DeviceIdentity.h"

#include <EEPROM.h>
#include <cstring>

namespace
{
  struct LegacyMqttConfig
  {
    uint32_t magic;
    char host[64];
    uint16_t port;
    char wifiSsid[33];
    char wifiPassword[65];
    char webPassword[65];
  };
  struct Version2MqttConfig
  {
    uint32_t magic;
    char host[64];
    uint16_t port;
    char wifiSsid[33];
    char wifiPassword[65];
    char webPassword[65];
    uint16_t version;
    uint32_t checksum;
  };
  struct Version3MqttConfig
  {
    uint32_t magic;
    char host[64];
    uint16_t port;
    char wifiSsid[33];
    char wifiPassword[65];
    char webPassword[65];
    char otaBpDeviceId[65];
    char otaBpSensorId[65];
    uint16_t version;
    uint32_t checksum;
  };
  struct Version4MqttConfig
  {
    uint32_t magic;
    char host[64];
    uint16_t port;
    char mqttUsername[65];
    char mqttPassword[65];
    char wifiSsid[33];
    char wifiPassword[65];
    char webPassword[65];
    char otaBpDeviceId[65];
    char otaBpSensorId[65];
    uint16_t version;
    uint32_t checksum;
  };
  struct Version5MqttConfig
  {
    uint32_t magic;
    char host[64];
    uint16_t port;
    char mqttUsername[65];
    char mqttPassword[65];
    char wifiSsid[33];
    char wifiPassword[65];
    char webPassword[65];
    char otaBpDeviceId[65];
    char otaBpSensorId[65];
    char heaterActorId[65];
    char coolerActorId[65];
    uint16_t version;
    uint32_t checksum;
  };
  using Version6MqttConfig = MqttConfig;

  uint32_t checksumBytes(const void *object, size_t bytes)
  {
    const uint8_t *data = reinterpret_cast<const uint8_t *>(object);
    uint32_t hash = 2166136261UL;
    for (size_t i = 0; i < bytes; ++i)
    {
      hash ^= data[i];
      hash *= 16777619UL;
    }
    return hash;
  }
  template <typename T>
  uint32_t checksumForVersion(const T &config) { return checksumBytes(&config, offsetof(T, checksum)); }
  bool terminated(const char *text, size_t size) { return memchr(text, '\0', size) != nullptr; }
  void setDefaults(MqttConfig &config)
  {
    memset(&config, 0, sizeof(config));
    config.magic = CONFIG_MAGIC;
    config.version = CONFIG_VERSION;
    config.port = DEFAULT_MQTT_PORT;
    copyText(config.networkHostname, sizeof(config.networkHostname), defaultNetworkHostname().c_str());
    copyText(config.webPassword, sizeof(config.webPassword), DEFAULT_WEB_PASSWORD);
  }
  void copyCommon(MqttConfig &to, const char *host, uint16_t port, const char *ssid, const char *wifiPassword, const char *webPassword, const char *deviceId = "", const char *sensorId = "", const char *username = "", const char *password = "", const char *heaterActorId = "", const char *coolerActorId = "")
  {
    setDefaults(to);
    copyText(to.host, sizeof(to.host), host);
    to.port = port;
    copyText(to.wifiSsid, sizeof(to.wifiSsid), ssid);
    copyText(to.wifiPassword, sizeof(to.wifiPassword), wifiPassword);
    copyText(to.webPassword, sizeof(to.webPassword), webPassword);
    copyText(to.otaBpDeviceId, sizeof(to.otaBpDeviceId), deviceId);
    copyText(to.otaBpSensorId, sizeof(to.otaBpSensorId), sensorId);
    copyText(to.mqttUsername, sizeof(to.mqttUsername), username);
    copyText(to.mqttPassword, sizeof(to.mqttPassword), password);
    copyText(to.heaterActorId, sizeof(to.heaterActorId), heaterActorId);
    copyText(to.coolerActorId, sizeof(to.coolerActorId), coolerActorId);
  }
  template <typename T>
  bool validOld(const T &v, uint16_t version) { return v.magic == CONFIG_MAGIC && v.version == version && v.checksum == checksumForVersion(v) && v.port != 0; }
  bool validCurrent(const MqttConfig &config) { return config.magic == CONFIG_MAGIC && config.version == CONFIG_VERSION && config.checksum == checksumForVersion(config) && config.port != 0 && terminated(config.host, sizeof(config.host)) && terminated(config.mqttUsername, sizeof(config.mqttUsername)) && terminated(config.mqttPassword, sizeof(config.mqttPassword)) && terminated(config.wifiSsid, sizeof(config.wifiSsid)) && terminated(config.wifiPassword, sizeof(config.wifiPassword)) && terminated(config.networkHostname, sizeof(config.networkHostname)) && config.networkHostname[0] && terminated(config.webPassword, sizeof(config.webPassword)) && terminated(config.otaBpDeviceId, sizeof(config.otaBpDeviceId)) && terminated(config.otaBpSensorId, sizeof(config.otaBpSensorId)) && terminated(config.heaterActorId, sizeof(config.heaterActorId)) && terminated(config.coolerActorId, sizeof(config.coolerActorId)); }
}

void copyText(char *destination, size_t size, const char *source)
{
  strncpy(destination, source, size - 1);
  destination[size - 1] = '\0';
}
ConfigLoadResult loadConfig(MqttConfig &config)
{
  EEPROM.get(0, config);
  if (validCurrent(config))
    return ConfigLoadResult::Valid;
  Version6MqttConfig v6{};
  EEPROM.get(0, v6);
  if (validOld(v6, 7) && terminated(v6.host, sizeof(v6.host)) && terminated(v6.mqttUsername, sizeof(v6.mqttUsername)) && terminated(v6.mqttPassword, sizeof(v6.mqttPassword)) && terminated(v6.wifiSsid, sizeof(v6.wifiSsid)) && terminated(v6.wifiPassword, sizeof(v6.wifiPassword)) && terminated(v6.webPassword, sizeof(v6.webPassword)) && terminated(v6.otaBpDeviceId, sizeof(v6.otaBpDeviceId)) && terminated(v6.otaBpSensorId, sizeof(v6.otaBpSensorId)) && terminated(v6.heaterActorId, sizeof(v6.heaterActorId)) && terminated(v6.coolerActorId, sizeof(v6.coolerActorId)))
  {
    copyCommon(config, v6.host, v6.port, v6.wifiSsid, v6.wifiPassword, v6.webPassword, v6.otaBpDeviceId, v6.otaBpSensorId, v6.mqttUsername, v6.mqttPassword, v6.heaterActorId, v6.coolerActorId);
    saveConfig(config);
    return ConfigLoadResult::MigratedLegacy;
  }
  Version5MqttConfig v5{};
  EEPROM.get(0, v5);
  if (validOld(v5, 5) && terminated(v5.host, sizeof(v5.host)) && terminated(v5.mqttUsername, sizeof(v5.mqttUsername)) && terminated(v5.mqttPassword, sizeof(v5.mqttPassword)) && terminated(v5.wifiSsid, sizeof(v5.wifiSsid)) && terminated(v5.wifiPassword, sizeof(v5.wifiPassword)) && terminated(v5.webPassword, sizeof(v5.webPassword)) && terminated(v5.otaBpDeviceId, sizeof(v5.otaBpDeviceId)) && terminated(v5.otaBpSensorId, sizeof(v5.otaBpSensorId)) && terminated(v5.heaterActorId, sizeof(v5.heaterActorId)) && terminated(v5.coolerActorId, sizeof(v5.coolerActorId)))
  {
    copyCommon(config, v5.host, v5.port, v5.wifiSsid, v5.wifiPassword, v5.webPassword, v5.otaBpDeviceId, v5.otaBpSensorId, v5.mqttUsername, v5.mqttPassword, v5.heaterActorId, v5.coolerActorId);
    saveConfig(config);
    return ConfigLoadResult::MigratedLegacy;
  }
  Version4MqttConfig v4{};
  EEPROM.get(0, v4);
  if (validOld(v4, 4) && terminated(v4.host, sizeof(v4.host)) && terminated(v4.mqttUsername, sizeof(v4.mqttUsername)) && terminated(v4.mqttPassword, sizeof(v4.mqttPassword)) && terminated(v4.wifiSsid, sizeof(v4.wifiSsid)) && terminated(v4.wifiPassword, sizeof(v4.wifiPassword)) && terminated(v4.webPassword, sizeof(v4.webPassword)) && terminated(v4.otaBpDeviceId, sizeof(v4.otaBpDeviceId)) && terminated(v4.otaBpSensorId, sizeof(v4.otaBpSensorId)))
  {
    copyCommon(config, v4.host, v4.port, v4.wifiSsid, v4.wifiPassword, v4.webPassword, v4.otaBpDeviceId, v4.otaBpSensorId, v4.mqttUsername, v4.mqttPassword);
    saveConfig(config);
    return ConfigLoadResult::MigratedLegacy;
  }
  Version3MqttConfig v3{};
  EEPROM.get(0, v3);
  if (validOld(v3, 3) && terminated(v3.host, sizeof(v3.host)) && terminated(v3.wifiSsid, sizeof(v3.wifiSsid)) && terminated(v3.wifiPassword, sizeof(v3.wifiPassword)) && terminated(v3.webPassword, sizeof(v3.webPassword)) && terminated(v3.otaBpDeviceId, sizeof(v3.otaBpDeviceId)) && terminated(v3.otaBpSensorId, sizeof(v3.otaBpSensorId)))
  {
    copyCommon(config, v3.host, v3.port, v3.wifiSsid, v3.wifiPassword, v3.webPassword, v3.otaBpDeviceId, v3.otaBpSensorId);
    saveConfig(config);
    return ConfigLoadResult::MigratedLegacy;
  }
  Version2MqttConfig v2{};
  EEPROM.get(0, v2);
  if (validOld(v2, 2) && terminated(v2.host, sizeof(v2.host)) && terminated(v2.wifiSsid, sizeof(v2.wifiSsid)) && terminated(v2.wifiPassword, sizeof(v2.wifiPassword)) && terminated(v2.webPassword, sizeof(v2.webPassword)))
  {
    copyCommon(config, v2.host, v2.port, v2.wifiSsid, v2.wifiPassword, v2.webPassword);
    saveConfig(config);
    return ConfigLoadResult::MigratedLegacy;
  }
  LegacyMqttConfig legacy{};
  EEPROM.get(0, legacy);
  if (legacy.magic == CONFIG_MAGIC && legacy.port != 0 && terminated(legacy.host, sizeof(legacy.host)) && terminated(legacy.wifiSsid, sizeof(legacy.wifiSsid)) && terminated(legacy.wifiPassword, sizeof(legacy.wifiPassword)) && terminated(legacy.webPassword, sizeof(legacy.webPassword)))
  {
    copyCommon(config, legacy.host, legacy.port, legacy.wifiSsid, legacy.wifiPassword, legacy.webPassword[0] ? legacy.webPassword : DEFAULT_WEB_PASSWORD);
    saveConfig(config);
    return ConfigLoadResult::MigratedLegacy;
  }
  setDefaults(config);
  saveConfig(config);
  return ConfigLoadResult::EmptyOrInvalid;
}
bool saveConfig(MqttConfig &config)
{
  config.magic = CONFIG_MAGIC;
  config.version = CONFIG_VERSION;
  config.checksum = checksumForVersion(config);
  EEPROM.put(0, config);
  if (!EEPROM.commit())
    return false;
  MqttConfig verified{};
  EEPROM.get(0, verified);
  return validCurrent(verified);
}
void restoreFactoryConfig(MqttConfig &config)
{
  for (size_t i = 0; i < EEPROM_BYTES; ++i)
    EEPROM.write(i, 0xFF);
  EEPROM.commit();
  setDefaults(config);
  saveConfig(config);
}
bool applyCleanDefaultsRelease(MqttConfig &config)
{
  uint32_t marker = 0;
  EEPROM.get(CLEAN_DEFAULTS_RELEASE_MARKER_OFFSET, marker);
  if (marker == CLEAN_DEFAULTS_RELEASE_MARKER)
    return false;
  // This intentionally removes every stored byte, including damaged or legacy
  // records, before writing the new blank factory-default record.
  restoreFactoryConfig(config);
  EEPROM.put(CLEAN_DEFAULTS_RELEASE_MARKER_OFFSET, CLEAN_DEFAULTS_RELEASE_MARKER);
  if (!EEPROM.commit())
    return false;
  uint32_t verified = 0;
  EEPROM.get(CLEAN_DEFAULTS_RELEASE_MARKER_OFFSET, verified);
  return verified == CLEAN_DEFAULTS_RELEASE_MARKER;
}
const char *configLoadResultText(ConfigLoadResult result)
{
  switch (result)
  {
  case ConfigLoadResult::Valid:
    return "Saved settings passed checksum.";
  case ConfigLoadResult::MigratedLegacy:
    return "Older saved settings migrated and protected with checksum.";
  case ConfigLoadResult::EmptyOrInvalid:
    return "No valid saved settings; setup AP will start.";
  }
  return "Unknown settings state.";
}
