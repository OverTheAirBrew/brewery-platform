import { PluginConfig } from '@overtheairbrew/plugins';

interface IFullTypes {
  modules: any[];
  devices: any[];
  logics: any;
}

export const findPluginConfigurationsOfType = (
  plugins: PluginConfig[],
  key: keyof IFullTypes,
) => {
  return plugins.reduce((prev, curr) => {
    if (!curr[key]) {
      return [...prev];
    }

    return [...prev, ...curr[key]];
  }, []);
};
