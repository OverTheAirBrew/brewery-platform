import { repositories } from '../setup';

export const createTestDeviceEntity = async () => {
  const { id } = await repositories.devices.create({
    name: 'testing',
    type: 'TestingDevice',
    config: {
      int: 1,
      select: 'a',
      text: 'test',
    },
  });

  return id;
};
