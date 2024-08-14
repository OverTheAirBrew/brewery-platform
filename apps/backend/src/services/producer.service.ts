import { Inject, Injectable } from '@nestjs/common';
import { ProducersDto, ProducersSchema } from '@overtheairbrew/models';
import { REPOSITORIES } from '../data/data.abstractions';
import { Producer } from '../data/entities/producer.entity';
import { IdResponseDto } from '../id.response.dto';

@Injectable()
export class ProducersService {
  constructor(
    @Inject(REPOSITORIES.ProducerRepository)
    private producerRepository: typeof Producer,
  ) {}

  async createProducer(producer: ProducersDto) {
    const validatedProducer = ProducersSchema.parse(producer);
    const { id } = await this.producerRepository.create(validatedProducer);
    return new IdResponseDto(id);
  }

  async getAllProducers() {
    const producers = await this.producerRepository.findAll();
    return await Promise.all(
      producers.map((producer) => ProducersSchema.parseAsync(producer)),
    );
  }

  async getOneProducer(producersId: string) {
    const producer = await this.producerRepository.findByPk(producersId);
    return ProducersSchema.parse(producer);
  }
}
