import { Inject, Injectable } from '@nestjs/common';
import {
  CreateKegRequest,
  GetKegResponse,
  GetKegResponseSchema,
} from '@overtheairbrew/models';
import { REPOSITORIES } from '../data/data.abstractions';
import { Beverage } from '../data/entities/beverage.entity';
import { Keg } from '../data/entities/keg.entity';
import { Producer } from '../data/entities/producer.entity';
import { KegDoesNotExistError } from '../errors/keg-does-not-exist-error';
import { IdResponseDto } from '../id.response.dto';

@Injectable()
export class KegsService {
  constructor(
    @Inject(REPOSITORIES.KegRepository)
    private readonly kegRepository: typeof Keg,
    @Inject(REPOSITORIES.BeverageRepository)
    private readonly beverageRepository: typeof Beverage,
  ) {}

  private getKegIncludes = {
    include: [
      {
        model: Beverage,
        attributes: ['name'],
        include: [
          {
            model: Producer,
            attributes: ['name'],
          },
        ],
      },
    ],
  };

  async createKeg(keg: CreateKegRequest) {
    const { id } = await this.kegRepository.create(keg);
    return new IdResponseDto(id);
  }

  async getAllKegs() {
    const kegs = await this.kegRepository.findAll({
      ...this.getKegIncludes,
    });

    return await Promise.all(kegs.map((keg) => this.mapKeg(keg)));
  }

  async getOneKeg(kegId: string) {
    const keg = await this.kegRepository.findByPk(kegId, {
      ...this.getKegIncludes,
    });

    if (!keg) throw new KegDoesNotExistError(kegId);

    return await this.mapKeg(keg);
  }

  async updateKeg(kegId: string, kegToUpdate: CreateKegRequest) {
    const keg = await this.kegRepository.findByPk(kegId, {
      include: [
        {
          model: Producer,
          attributes: ['name'],
        },
      ],
    });
    if (!keg) throw new KegDoesNotExistError(kegId);
    await keg.update(kegToUpdate);
    await keg.save();
  }

  async mapKeg(keg: Keg): Promise<GetKegResponse> {
    return await GetKegResponseSchema.parseAsync({
      ...keg.toJSON(),
    });
  }
}
