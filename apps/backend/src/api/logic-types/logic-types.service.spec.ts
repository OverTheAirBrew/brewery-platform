import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LogicTypesService } from './logic-types.service';
import { LogicTypeNotFoundError } from './errors/logic-type-not-found-error';
import { LogicIdentifier } from '@overtheairbrew/plugins';
import { TestBed } from '@suites/unit';

describe('LogicTypesService', () => {
  let service: LogicTypesService;
  let mockLogicA: any;
  let mockLogicB: any;

  beforeEach(async () => {
    mockLogicA = {
      name: 'logic-a',
      getConfigOptions: vi.fn().mockResolvedValue([
        {
          name: 'target',
          type: 'number',
          required: true,
          defaultValue: 20,
        },
      ]),
    };
    mockLogicB = {
      name: 'logic-b',
      getConfigOptions: vi.fn().mockResolvedValue([]),
    } as any;

    const { unit } = await TestBed.solitary(LogicTypesService)
      .mock<any[]>(LogicIdentifier)
      .final([mockLogicA, mockLogicB])
      .compile();

    service = unit;
  });

  describe('getAll', () => {
    it('returns mapped logic types for all configured logics', async () => {
      const result = await service.getAll();

      expect(result).toStrictEqual([
        {
          name: 'logic-a',
          properties: [
            {
              name: 'target',
              type: 'number',
              required: true,
              defaultValue: 20,
            },
          ],
        },
        {
          name: 'logic-b',
          properties: [],
        },
      ]);

      expect(mockLogicA.getConfigOptions).toHaveBeenCalledWith(undefined);
      expect(mockLogicB.getConfigOptions).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getByNameRaw', () => {
    it('returns the logic with the matching name', async () => {
      await expect(service.getByNameRaw('logic-b')).resolves.toBe(mockLogicB);
    });

    it('throws when the logic name is not found', async () => {
      await expect(service.getByNameRaw('missing')).rejects.toBeInstanceOf(
        LogicTypeNotFoundError,
      );
    });
  });
});
