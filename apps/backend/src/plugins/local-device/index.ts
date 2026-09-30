import { PluginConfig } from '@overtheairbrew/plugins';
import { LocalDevice } from './device';
import { LocalDeviceModule } from './module';

export const LocalDeviceConfig: PluginConfig = {
  type: 'device',
  devices: [LocalDevice],
  modules: [LocalDeviceModule],
};
