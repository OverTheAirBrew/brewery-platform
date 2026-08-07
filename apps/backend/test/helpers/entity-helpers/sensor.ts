import { repositories } from '../setup';

export const createTestSensorEntity = async (deviceId: string) => {
  const { id } = await repositories.sensors.create({
    name: 'testing',
    type: 'TestingSensor',
    device_id: deviceId,
    config: {
      int: 1,
    },
  });

  return id;
};
