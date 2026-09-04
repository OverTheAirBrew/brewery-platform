import { defineDevicePlugin } from '@overtheairbrew/plugins';
import { FtssDevice } from './device';
import { FtssDeviceModule } from './module';

export const FtssDeviceConfig = defineDevicePlugin({
  metadata: {
    id: 'ftss-device',
    name: 'FTSS Device',
    version: '1.0.0',
  },
  devices: [FtssDevice],
  modules: [FtssDeviceModule],
});
