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
          useFactory: (devices: Device<any>[] | Device<any>) => {
            return Array.isArray(devices) ? [...devices] : [devices];
          },
          inject: [...devices],
        },
        {
          provide: LogicIdentifier,
          useFactory: (logics: Logic<any>[] | Logic<any>) => {
            return Array.isArray(logics) ? [...logics] : [logics];
          },
          inject: [...logics],
        },
      ],
      exports: [DeviceIdentifier, LogicIdentifier],
    };
  }
}
