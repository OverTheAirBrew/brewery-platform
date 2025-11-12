import { repositories } from '../setup';

export const createTestSensorEntity = async (deviceId: string) => {
  const { id } = await repositories.sensors.create({
    name: 'testing',
    type: 'DummySensor',
    device_id: deviceId,
    config: {
      values: '1,2,3,4,5',
    },
  });

  return id;
};
