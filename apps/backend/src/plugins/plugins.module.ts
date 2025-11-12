import { DynamicModule, Module } from '@nestjs/common';
import { FtssDeviceConfig } from './ftss-device';
import { LocalDeviceConfig } from './local-device';
import {
  Device,
  DeviceIdentifier,
  Logic,
  LogicIdentifier,
} from '@overtheairbrew/plugins';
import { FermentationPidConfig } from './fermentation-pid';

const configs = [FtssDeviceConfig, LocalDeviceConfig, FermentationPidConfig];

@Module({})
export class PluginsModule {
  static register(): DynamicModule {
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
