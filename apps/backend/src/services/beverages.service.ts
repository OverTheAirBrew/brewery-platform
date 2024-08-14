import { Inject, Injectable } from '@nestjs/common';
import { BeverageDto, BeverageSchema } from '@overtheairbrew/models';
import { REPOSITORIES } from '../data/data.abstractions';
import { Beverage } from '../data/entities/beverage.entity';
import { BeverageDoesNotExistError } from '../errors/beverage-does-not-exist-error';
import { IdResponseDto } from '../id.response.dto';

@Injectable()
export class BeveragesService {
  constructor(
    @Inject(REPOSITORIES.BeverageRepository)
    private beverageRepository: typeof Beverage,
  ) {}

  async createBeverage(beverage: BeverageDto) {
    const { id } = await this.beverageRepository.create(beverage);
    return new IdResponseDto(id);
  }

  async getAllBeverages() {
    const beverages = await this.beverageRepository.findAll();
    return await Promise.all(
      beverages.map((beverage) => BeverageSchema.parseAsync(beverage)),
    );
  }

  async getOneBeverage(beverageId: string) {
    const beverage = await this.beverageRepository.findByPk(beverageId);
    return BeverageSchema.parse(beverage);
  }

  async updateBeverage(beverageId: string, beverageToUpdate: BeverageDto) {
    const beverage = await this.beverageRepository.findByPk(beverageId);

    if (!beverage) throw new BeverageDoesNotExistError(beverageId);

    await beverage.update(beverageToUpdate);

    await beverage.save();
  }
}
