import { Device, Logic, PluginConfig } from '@overtheairbrew/plugins';
import { findPluginConfigurationsOfType } from './find-plugin-configurations-of-type';

class TestDevice extends Device<any> {
  public sensors = [];
  public actors = [];

  validateConfiguration(config: any): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

class TestLogic extends Logic<any> {
  protected process(
    params: any,
    currentTemp: number,
    targetTemp: number,
  ): Promise<{ heatTime: number; waitTime: number; nextParams: any }> {
    throw new Error('Method not implemented.');
  }
}

describe('lib/utilities/find-plugins-of-type', () => {
  let pluginConfigs: PluginConfig[];

  beforeAll(() => {
    pluginConfigs = [
      {
        devices: [TestDevice],
        modules: [{ module: true }],
        type: 'device',
      },
      {
        type: 'logic',
        modules: [{ module: true }],
        logics: [TestLogic],
      },
    ];
  });

  it('should return a list of modules', async () => {
    const configuration = findPluginConfigurationsOfType(
      pluginConfigs,
      'modules',
    );

    expect(configuration).toHaveLength(2);
  });

  it('should return a list of devices', () => {
    const configuration = findPluginConfigurationsOfType(
      pluginConfigs,
      'devices',
    );
    expect(configuration).toHaveLength(1);
    expect(configuration[0].name).toBe('TestDevice');
  });

  it('should return a list of logics', () => {
    const configuration = findPluginConfigurationsOfType(
      pluginConfigs,
      'logics',
    );
    expect(configuration).toHaveLength(1);
    expect(configuration[0].name).toBe('TestLogic');
  });
});
