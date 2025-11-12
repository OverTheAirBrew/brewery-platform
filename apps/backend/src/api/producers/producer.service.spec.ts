import { Test } from '@nestjs/testing';
import { REPOSITORIES } from '../../data/data.abstractions';
import { ProducerDoesNotExistError } from '../errors/producer-does-not-exist-error';
import { IdResponseDto } from '../../id.response.dto';
import { ProducersService } from './producer.service';

describe('ProducerService', () => {
  let producerService: ProducersService;

  const mockRepository = {
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProducersService,
        {
          provide: REPOSITORIES.ProducerRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    producerService = module.get<ProducersService>(ProducersService);
  });

  describe('createProducer', () => {
    beforeEach(() => {
      mockRepository.create.mockResolvedValue({ id: 'id' });
    });

    it('should return an IdResponseDto', async () => {
      const result = await producerService.createProducer({
        name: 'name',
      });

      expect(mockRepository.create).toHaveBeenCalledWith({ name: 'name' });

      expect(result).toMatchObject({ id: 'id' });
      expect(result).toBeInstanceOf(IdResponseDto);
    });
  });

  describe('getAllProducers', () => {
    beforeEach(() => {
      mockRepository.findAll.mockResolvedValue([
        {
          name: 'name',
        },
      ]);
    });

    it('should return an array of ProducersDto', async () => {
      const result = await producerService.getAllProducers();

      expect(result).toMatchObject([{ name: 'name' }]);
    });
  });

  describe('getOneProducer', () => {
    beforeEach(() => {
      mockRepository.findByPk.mockResolvedValue({
        name: 'name',
      });
    });

    it('should return a ProducersDto', async () => {
      const result = await producerService.getOneProducer('id');

      expect(mockRepository.findByPk).toHaveBeenCalledWith('id');
      expect(result).toMatchObject({ name: 'name' });
    });
  });

  describe('updateProducer', () => {
    it('should update a producer', async () => {
      const mockUpdate = jest.fn();
      const mockSave = jest.fn();

      mockRepository.findByPk.mockResolvedValue({
        update: mockUpdate,
        save: mockSave,
      });

      await producerService.updateProducer('id', {
        name: 'UpdatedName',
      });

      expect(mockRepository.findByPk).toHaveBeenCalledWith('id');
      expect(mockUpdate).toHaveBeenCalledWith({
        name: 'UpdatedName',
      });
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw an error if the producer does not exist', async () => {
      mockRepository.findByPk.mockResolvedValue(null);

      await expect(
        producerService.updateProducer('id', {
          name: 'UpdatedName',
        }),
      ).rejects.toThrow(ProducerDoesNotExistError);
    });
  });
});
