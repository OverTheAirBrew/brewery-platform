import { DynamicModule, Module } from '@nestjs/common';
import {
  Device,
  DeviceIdentifier,
  Logic,
  LogicIdentifier,
  PluginConfig,
} from '@overtheairbrew/plugins';
import { findNodeModulesMatchingRegex } from './lib/find-node-modules-matching-regex';

@Module({})
export class PluginModule {
  static register(): DynamicModule {
    const plugins = findNodeModulesMatchingRegex(/^.*(@otabp\/|otabp-).*$/);

    const pluginImplementations: PluginConfig[] = plugins.map((plugin) => {
      const req = require(plugin.path);
      return req.default;
    });

    const { modules, devices, logics } = pluginImplementations
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
      module: PluginModule,
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
