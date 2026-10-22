import { PluginConfig } from '@overtheairbrew/plugins';
import { FtssDevice } from './device';
import { FtssDeviceModule } from './module';

export const FtssDeviceConfig: PluginConfig = {
  type: 'device',
  devices: [FtssDevice],
  modules: [FtssDeviceModule],
};
