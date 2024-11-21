import { Inject, Injectable } from '@nestjs/common';
import {
  CreateProducersRequest,
  GetProducersResponseSchema,
  ProducersSchema,
} from '@overtheairbrew/models';
import { REPOSITORIES } from '../data/data.abstractions';
import { Producer } from '../data/entities/producer.entity';
import { ProducerDoesNotExistError } from '../errors/producer-does-not-exist-error';
import { IdResponseDto } from '../id.response.dto';

@Injectable()
export class ProducersService {
  constructor(
    @Inject(REPOSITORIES.ProducerRepository)
    private producerRepository: typeof Producer,
  ) {}

  async createProducer(producer: CreateProducersRequest) {
    const validatedProducer = ProducersSchema.parse(producer);
    const { id } = await this.producerRepository.create(validatedProducer);
    return new IdResponseDto(id);
  }

  async getAllProducers() {
    const producers = await this.producerRepository.findAll();
    return await Promise.all(
      producers.map((producer) =>
        GetProducersResponseSchema.parseAsync(producer),
      ),
    );
  }

  async getOneProducer(producersId: string) {
    const producer = await this.producerRepository.findByPk(producersId);
    return GetProducersResponseSchema.parse(producer);
  }

  async updateProducer(
    producersId: string,
    producerToUpdate: CreateProducersRequest,
  ) {
    const producer = await this.producerRepository.findByPk(producersId);
    if (!producer) throw new ProducerDoesNotExistError(producersId);
    await producer.update(producerToUpdate);
    await producer.save();
  }
}
