import { repositories } from '../setup';

export const createTestDeviceEntity = async () => {
  const { id } = await repositories.devices.create({
    name: 'testing',
    type: 'LocalDevice',
    config: {},
  });

  return id;
};
