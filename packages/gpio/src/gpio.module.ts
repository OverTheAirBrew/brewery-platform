import { Logger, Module } from '@nestjs/common';
import { GpioSetV2_2, GpioSetV1_6, IGpioSet, GpioSetVDummy } from './gpioset';
import { Utils } from './utils';
import { GpioService } from './gpio';

@Module({
  providers: [
    GpioSetV1_6,
    GpioSetV2_2,
    GpioSetVDummy,
    GpioService,
    Utils,
    {
      provide: IGpioSet,
      useFactory(
        gpioV1_6: GpioSetV1_6,
        gpioV2_2: GpioSetV2_2,
        gpioDummy: GpioSetVDummy,
        utils: Utils,
      ) {
        const logger = new Logger('GPIO SET FACTORY');
        const version = utils
          .exeFile('gpiodetect', ['-v'])
          ?.split('\n')
          ?.shift()
          ?.substring(22)
          .trim()
          .substring(0, 4);

        switch (version) {
          case '1.6':
            logger.log('Using GPIO Set version 1.6');
            return gpioV1_6;
          case '2.2':
            logger.log('Using GPIO Set version 2.2');
            return gpioV2_2;
          default:
            logger.log('Using Dummy GPIO Set');
            return gpioDummy;
        }
      },
      inject: [GpioSetV1_6, GpioSetV2_2, GpioSetVDummy, Utils],
    },
  ],
  exports: [GpioService],
})
export class GpioModule {}
