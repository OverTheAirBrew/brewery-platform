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
  return plugins.reduce<any[]>((prev, curr) => {
    if (!(key in plugins)) {
      return [...prev];
    }

    return [...prev, ...(curr as any)[key]];
  }, []);
};
