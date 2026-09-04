import { defineLogicPlugin } from '@overtheairbrew/plugins';
import { FermentationPid } from './logic';
import { FermentationPidModule } from './module';

export const FermentationPidConfig = defineLogicPlugin({
  metadata: {
    id: 'fermentation-pid',
    name: 'Fermentation PID',
    version: '1.0.0',
  },
  logics: [FermentationPid],
  modules: [FermentationPidModule],
});
