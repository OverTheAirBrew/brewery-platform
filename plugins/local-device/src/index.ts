import { PluginConfig } from '@overtheairbrew/plugins';
import { LocalDevice } from './device';
import { LocalDeviceModule } from './module';

const config: PluginConfig = {
  type: 'device',
  devices: [LocalDevice],
  modules: [LocalDeviceModule],
};

export default config;
