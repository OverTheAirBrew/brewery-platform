import { DynamicModule, Module } from '@nestjs/common';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  Device,
  DeviceIdentifier,
  Logic,
  LogicIdentifier,
  PluginConfig,
  validatePluginConfigs,
} from '@overtheairbrew/plugins';

function isPluginConfig(value: unknown): value is PluginConfig {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const plugin = value as Partial<PluginConfig>;

  if (plugin.type !== 'device' && plugin.type !== 'logic') {
    return false;
  }

  if (!plugin.metadata || typeof plugin.metadata !== 'object') {
    return false;
  }

  const metadata = plugin.metadata;
  return (
    typeof metadata.id === 'string' &&
    typeof metadata.name === 'string' &&
    typeof metadata.version === 'string'
  );
}

function loadPluginConfigs(): PluginConfig[] {
  const pluginDirectories = readdirSync(__dirname, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return pluginDirectories.map((pluginDirectory) => {
    const pluginModule = require(join(__dirname, pluginDirectory)) as Record<
      string,
      unknown
    >;

    const pluginConfig = Object.values(pluginModule).find(isPluginConfig);
    if (!pluginConfig) {
      throw new Error(
        `Could not find a valid plugin config export in ${pluginDirectory}`,
      );
    }

    return pluginConfig;
  });
}

@Module({})
export class PluginsModule {
  static register(): DynamicModule {
    const configs = loadPluginConfigs();

    validatePluginConfigs(configs);

    const { modules, devices, logics } = configs
      .map((plugin) => ({
        devices: plugin.type === 'device' ? plugin.devices : [],
        logics: plugin.type === 'logic' ? plugin.logics : [],
        modules: plugin.modules || [],
      }))
      .reduce(
        (prev, curr) => {
          return {
            devices: [...prev.devices, ...curr.devices],
            modules: [...prev.modules, ...curr.modules],
            logics: [...prev.logics, ...curr.logics],
          };
        },
        {
          devices: [],
          modules: [],
          logics: [],
        },
      );

    return {
      global: true,
      module: PluginsModule,
      imports: [...modules],
      providers: [
        {
          provide: DeviceIdentifier,
          useFactory: (...device: Device<any>[]) => {
            return Array.isArray(device) ? [...device] : [device];
          },
          inject: [...devices],
        },
        {
          provide: LogicIdentifier,
          useFactory: (...logic: Logic<any>[]) => {
            return Array.isArray(logic) ? [...logic] : [logic];
          },
          inject: [...logics],
        },
      ],
      exports: [DeviceIdentifier, LogicIdentifier],
    };
  }
}
