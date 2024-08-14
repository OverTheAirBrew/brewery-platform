import { Inject, Injectable } from '@nestjs/common';
import {
  DisplayDto,
  DisplaySchema,
  DisplayTapInformationSchema,
} from '@overtheairbrew/models';
import { REPOSITORIES } from '../data/data.abstractions';
import { Beverage } from '../data/entities/beverage.entity';
import { Display } from '../data/entities/display.entity';
import { Keg } from '../data/entities/keg.entity';
import { Producer } from '../data/entities/producer.entity';
import { Tap } from '../data/entities/tap.entity';
import { IdResponseDto } from '../id.response.dto';

enum DisplayStatus {
  UNREGISTERED = 'UNREGISTERED',
  TAPUNASSIGNED = 'TAPUNASSIGNED',
  NOBEVERAGE = 'NOBEVERAGE',
  COMPLETE = 'COMPLETE',
  UNKNOWN = 'UNKNOWN',
}

@Injectable()
export class DisplaysService {
  constructor(
    @Inject(REPOSITORIES.DisplayRepository)
    private displayRepository: typeof Display,
  ) {}

  async createDisplay(display: DisplayDto) {
    const { id } = await this.displayRepository.create(display);
    return new IdResponseDto(id);
  }

  async getDisplays() {
    const displays = await this.displayRepository.findAll();
    return await Promise.all(
      displays.map((display) => DisplaySchema.parseAsync(display)),
    );
  }

  async getDisplayInformationByCode(deviceCode: string) {
    const display = await this.displayRepository.findOne({
      where: {
        deviceCode: deviceCode,
      },
      include: [
        {
          model: Tap,
          as: 'tap',
          include: [
            {
              model: Keg,
              include: [
                {
                  model: Beverage,
                  include: [
                    {
                      model: Producer,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const status = await this.calculateDisplayStatus(display);

    return DisplayTapInformationSchema.parseAsync({
      status,
      beverage: display?.tap?.keg?.beverage?.producer
        ? {
            id: display.tap.keg.beverage.id,
            name: display.tap.keg.beverage.name,
            style: display.tap.keg.beverage.style,
            abv: display.tap.keg.beverage.abv,
            description: display.tap.keg.beverage.description,
            producer: display.tap.keg.beverage.producer.name,
          }
        : undefined,
    });
  }

  private async calculateDisplayStatus(display: Display | null) {
    if (!display) return DisplayStatus.UNREGISTERED;
    if (!display.tap) return DisplayStatus.TAPUNASSIGNED;
    if (!display.tap.keg?.beverage_id) return DisplayStatus.NOBEVERAGE;
    if (display.tap.keg.beverage_id) return DisplayStatus.COMPLETE;
  }
}
