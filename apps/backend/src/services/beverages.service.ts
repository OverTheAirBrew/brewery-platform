import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBeverageRequest,
  GetBeverageRequestSchema,
} from '@overtheairbrew/models';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { REPOSITORIES } from '../data/data.abstractions';
import { Beverage } from '../data/entities/beverage.entity';
import { Image } from '../data/entities/image.entity';
import { Producer } from '../data/entities/producer.entity';
import { BeverageDoesNotExistError } from '../errors/beverage-does-not-exist-error';
import { ImageDoesNotExistError } from '../errors/image-does-not-exist-error';
import { IGlobalConfig } from '../global.config';
import { IdResponseDto } from '../id.response.dto';

@Injectable()
export class BeveragesService {
  constructor(
    @Inject(REPOSITORIES.BeverageRepository)
    private beverageRepository: typeof Beverage,
    @Inject(REPOSITORIES.ImageRepository) private imageRepository: typeof Image,
    private configService: ConfigService,
  ) {}

  private getBeverageIncludes = {
    include: [
      {
        model: Producer,
        attributes: ['name'],
      },
    ],
  };

  async createBeverage(
    beverage: CreateBeverageRequest,
    file: Express.Multer.File,
  ) {
    await this.imageRepository.create({
      id: file.filename,
      mimetype: file.mimetype,
      originalName: file.originalname,
    });

    const { id } = await this.beverageRepository.create({
      ...beverage,
      image_id: file.filename,
    });

    return new IdResponseDto(id);
  }

  async getAllBeverages() {
    const beverages = await this.beverageRepository.findAll({
      ...this.getBeverageIncludes,
    });
    return await Promise.all(
      beverages.map((beverage) =>
        GetBeverageRequestSchema.parseAsync(beverage),
      ),
    );
  }

  async getOneBeverage(beverageId: string) {
    const beverage = await this.beverageRepository.findByPk(beverageId, {
      ...this.getBeverageIncludes,
    });
    return GetBeverageRequestSchema.parse(beverage);
  }

  async updateBeverage(
    beverageId: string,
    beverageToUpdate: CreateBeverageRequest,
  ) {
    const beverage = await this.beverageRepository.findByPk(beverageId);

    if (!beverage) throw new BeverageDoesNotExistError(beverageId);

    await beverage.update(beverageToUpdate);

    await beverage.save();
  }

  async getBeverageImage(beverageId: string) {
    const beverage = await this.beverageRepository.findByPk(beverageId, {
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['id'],
        },
      ],
      attributes: ['id'],
    });

    if (!beverage?.image) throw new BeverageDoesNotExistError(beverageId);

    const globalConfig = this.configService.get<IGlobalConfig>('GLOBAL');

    const imagePath = join(globalConfig!.uploadDirectory, beverage.image.id);

    if (existsSync(imagePath)) {
      return createReadStream(imagePath);
    }

    throw new ImageDoesNotExistError(beverage.image.id);
  }
}
