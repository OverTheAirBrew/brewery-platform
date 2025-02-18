import { Inject, Injectable } from '@nestjs/common';
import { TapDto, TapSchema } from '@overtheairbrew/models';
import { REPOSITORIES } from '../data/data.abstractions';
import { Tap } from '../data/entities/tap.entity';
import { TapDoesNotExistError } from '../errors/tap-does-not-exist-error';
import { EventsGateway } from '../events/events.gateway';
import { IdResponseDto } from '../id.response.dto';

@Injectable()
export class TapsService {
  constructor(
    @Inject(REPOSITORIES.TapRepository) private tapRepository: typeof Tap,
    private eventsGateway: EventsGateway,
  ) {}

  async createTap(tap: TapDto) {
    const { id } = await this.tapRepository.create(tap);

    return new IdResponseDto(id);
  }

  async getAllTaps() {
    const taps = await this.tapRepository.findAll();
    return await Promise.all(taps.map((tap) => TapSchema.parseAsync(tap)));
  }

  async getOneTap(tapId: string) {
    const tap = await this.tapRepository.findByPk(tapId);
    return TapSchema.parse(tap);
  }

  async updateTap(tapId: string, tapToUpdate: TapDto) {
    const tap = await this.tapRepository.findByPk(tapId);
    if (!tap) throw new TapDoesNotExistError(tapId);
    await tap.update(tapToUpdate);
    await tap.save();
  }
}
