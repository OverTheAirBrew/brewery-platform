import { PluginConfig } from '@overtheairbrew/plugins';
import { FermentationPid } from './logic';
import { FermentationPidModule } from './module';

export const FermentationPidConfig: PluginConfig = {
  type: 'logic',
  logics: [FermentationPid],
  modules: [FermentationPidModule],
};
