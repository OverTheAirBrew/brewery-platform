import { defineDevicePlugin } from '@overtheairbrew/plugins';
import { LocalDevice } from './device';
import { LocalDeviceModule } from './module';

export const LocalDeviceConfig = defineDevicePlugin({
  metadata: {
    id: 'local-device',
    name: 'Local Device',
    version: '1.0.0',
  },
  devices: [LocalDevice],
  modules: [LocalDeviceModule],
});
