import { Device, Logic } from '../base-types';

export type PluginConfig = DevicePluginConfig | LogicPluginConfig;

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
}

export type PluginType = 'device' | 'logic';

export interface IPluginConfig {
  type: PluginType;
  metadata: PluginMetadata;
  modules?: any[];
  mqttMessageSchemas?: string[];
}

export interface DevicePluginConfig extends IPluginConfig {
  type: 'device';
  devices: (abstract new (...args: any[]) => Device<any>)[];
}

export interface LogicPluginConfig extends IPluginConfig {
  type: 'logic';
  logics: (abstract new (...args: any[]) => Logic<any>)[];
}

export function defineDevicePlugin(
  config: Omit<DevicePluginConfig, 'type'>,
): DevicePluginConfig {
  return {
    ...config,
    type: 'device',
    modules: config.modules || [],
  };
}

export function defineLogicPlugin(
  config: Omit<LogicPluginConfig, 'type'>,
): LogicPluginConfig {
  return {
    ...config,
    type: 'logic',
    modules: config.modules || [],
  };
}

export function validatePluginConfigs(configs: PluginConfig[]): void {
  const pluginIds = new Set<string>();
  const providerIds = new Set<string>();

  configs.forEach((plugin) => {
    const pluginId = plugin.metadata.id;
    if (pluginIds.has(pluginId)) {
      throw new Error(`Duplicate plugin id detected: ${pluginId}`);
    }
    pluginIds.add(pluginId);

    const providers =
      plugin.type === 'device'
        ? plugin.devices.map((device) => device.name)
        : plugin.logics.map((logic) => logic.name);

    providers.forEach((providerName) => {
      const providerId = `${plugin.type}:${providerName}`;
      if (providerIds.has(providerId)) {
        throw new Error(
          `Duplicate ${plugin.type} provider detected: ${providerName}`,
        );
      }
      providerIds.add(providerId);
    });
  });
}
