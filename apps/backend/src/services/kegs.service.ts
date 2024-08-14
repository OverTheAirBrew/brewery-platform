import { Inject, Injectable } from '@nestjs/common';
import { KegDto, KegSchema } from '@overtheairbrew/models';
import { REPOSITORIES } from '../data/data.abstractions';
import { Keg } from '../data/entities/keg.entity';
import { KegDoesNotExistError } from '../errors/keg-does-not-exist-error';
import { IdResponseDto } from '../id.response.dto';

@Injectable()
export class KegsService {
  constructor(
    @Inject(REPOSITORIES.KegRepository)
    private readonly kegRepository: typeof Keg,
  ) {}

  async createKeg(keg: KegDto) {
    const { id } = await this.kegRepository.create(keg);
    return new IdResponseDto(id);
  }

  async getAllKegs() {
    const kegs = await this.kegRepository.findAll();
    return await Promise.all(kegs.map((keg) => KegSchema.parseAsync(keg)));
  }

  async getOneKeg(kegId: string) {
    const keg = await this.kegRepository.findByPk(kegId);
    return KegSchema.parse(keg);
  }

  async updateKeg(kegId: string, kegToUpdate: KegDto) {
    const keg = await this.kegRepository.findByPk(kegId);
    if (!keg) throw new KegDoesNotExistError(kegId);
    await keg.update(kegToUpdate);
    await keg.save();
  }
}
