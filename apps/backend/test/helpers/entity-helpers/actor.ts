import { repositories } from '../setup';

export const createTestActorEntity = async (deviceId: string) => {
  const { id } = await repositories.actors.create({
    name: 'testing',
    type: 'TestingActor',
    device_id: deviceId,
    config: {
      test: 'hello',
    },
  });

  return id;
};
