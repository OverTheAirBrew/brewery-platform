import { StreamController } from './stream';

describe('mechanisms/stream', () => {
  describe('findDevices', () => {
    it('should return the devices set in the constructor', async () => {
      const service = new StreamController(false, [
        {
          address: '11231231231231',
          expectedValues: [],
        },
        {
          address: '42343242342323',
          expectedValues: [],
        },
      ]);

      const values = await service.findDevices();
      expect(values).toMatchObject(['11231231231231', '42343242342323']);
    });
  });

  describe('getCurrentValue', () => {
    it('should repeat past the last value if release is enabled', async () => {
      const service = new StreamController(true, [
        {
          address: 'test',
          expectedValues: [1, 2, 3],
        },
      ]);

      await service.getCurrentValue('test');
      await service.getCurrentValue('test');
      await service.getCurrentValue('test');
      const finalValue = await service.getCurrentValue('test');

      expect(finalValue.celsius).toBe(1);
    });

    it('should error if repeat is disabled and its called too many times', async () => {
      const service = new StreamController(false, [
        {
          address: 'test',
          expectedValues: [1, 2, 3],
        },
      ]);

      try {
        await service.getCurrentValue('test');
        await service.getCurrentValue('test');
        await service.getCurrentValue('test');
        await service.getCurrentValue('test');
        fail('should have thrown an error');
      } catch (err: any) {
        expect(err.message).toBe('No values');
      }
    });

    it('should error if the device is invalid', async () => {
      const service = new StreamController(false, [
        {
          address: 'test',
          expectedValues: [1, 2, 3],
        },
      ]);

      try {
        await service.getCurrentValue('unknown');
        fail('should have thrown an error');
      } catch (err: any) {
        expect(err.message).toBe('No values');
      }
    });
  });
});
