import { repositories } from '../setup';

export const createTestActorEntity = async (deviceId: string) => {
  const { id } = await repositories.actors.create({
    name: 'testing',
    type: 'DummyActor',
    device_id: deviceId,
    config: {},
  });

  return id;
};
