import { Device, Logic } from '../base-types';

export type PluginConfig = IPluginConfig &
  (IDevicePluginConfig | ILogicPluginConfig);

export interface IPluginConfig {
  type: string;
  modules: any[];
}

export interface IDevicePluginConfig {
  type: 'device';
  devices: (abstract new (...args: any[]) => Device<any>)[];
}

export interface ILogicPluginConfig {
  type: 'logic';
  logics: (abstract new (...args: any[]) => Logic<any>)[];
}
