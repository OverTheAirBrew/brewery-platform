import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  DisplayDto,
  DisplayLoginSchema,
  DisplaySchema,
  DisplayTapInformationSchema,
  DisplayTapInformationUnauthenticatedSchema,
} from '@overtheairbrew/models';
import {
  DisplayUpdatedMessage,
  LoginCallback,
} from '@overtheairbrew/socket-events';
import { toDataURL } from 'qrcode';
import { REPOSITORIES } from '../data/data.abstractions';
import { Beverage } from '../data/entities/beverage.entity';
import { DisplayLogin } from '../data/entities/display-logins';
import { Display } from '../data/entities/display.entity';
import { Keg } from '../data/entities/keg.entity';
import { Producer } from '../data/entities/producer.entity';
import { Tap } from '../data/entities/tap.entity';
import { AuthenticationKeyNoLongerValidError } from '../errors/authentication-id-no-longer-value-error';
import { DisplayDoesNotExistError } from '../errors/display-does-not-exist-error';
import { IdResponseDto } from '../id.response.dto';
import { SseService } from '../sse/sse.service';

enum DisplayStatus {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
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
    @Inject(REPOSITORIES.DeviceLoginsRepository)
    private displayLoginsRepository: typeof DisplayLogin,
    private sseService: SseService,
    private jwtService: JwtService,
  ) {}

  async createDisplay(display: DisplayDto) {
    const { id, deviceCode } = await this.displayRepository.create(display);

    await this.sseService.emitEvent(DisplayUpdatedMessage)({
      deviceCode,
    });

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

  async updateDisplay(displayId: string, displayToUpdate: DisplayDto) {
    const display = await this.displayRepository.findByPk(displayId);
    if (!display) throw new DisplayDoesNotExistError(displayId);
    await display.update(displayToUpdate);
    await display.save();

    await this.sseService.emitEvent(DisplayUpdatedMessage)({
      deviceCode: display.deviceCode,
    });
  }

  async generateLoginQr(serial: string, siteUrl: string) {
    let login = await this.displayLoginsRepository.findOne({
      where: { serial, authenticated: false },
    });

    if (!login) {
      login = await this.displayLoginsRepository.create({
        serial,
      });
    }

    const loginUrl = `${siteUrl}/login?displayLoginId=${login.id}`;
    const qrCode = await toDataURL(loginUrl);

    return DisplayTapInformationUnauthenticatedSchema.parseAsync({
      status: DisplayStatus.UNAUTHENTICATED,
      qrCode,
      loginId: login.id,
    });
  }

  async authenticateDisplay(id: string) {
    const displayLogin = await this.displayLoginsRepository.findByPk(id);
    if (!displayLogin) throw new DisplayDoesNotExistError(id);
    await displayLogin.update({ authenticated: true });
    await displayLogin.save();

    await this.sseService.emitEvent(LoginCallback)({
      deviceCode: displayLogin.serial,

      deviceToken: this.jwtService.sign(
        JSON.stringify({
          display_id: displayLogin.id,
          scopes: ['tap-display'],
        }),
      ),
    });
  }

  async getDisplayLogin(id: string) {
    const displayLogin = await this.displayLoginsRepository.findOne({
      where: { id, authenticated: false },
    });

    if (!displayLogin) throw new AuthenticationKeyNoLongerValidError(id);

    return await DisplayLoginSchema.parseAsync(displayLogin);
  }

  async isDisplayAuthenticated(id: string) {
    const displayLogin = await this.displayLoginsRepository.findByPk(id);
    if (!displayLogin) throw new DisplayDoesNotExistError(id);
    return displayLogin.authenticated;
  }

  private async calculateDisplayStatus(display: Display | null) {
    if (!display) return DisplayStatus.UNREGISTERED;
    if (!display.tap) return DisplayStatus.TAPUNASSIGNED;
    if (!display.tap.keg?.beverage_id) return DisplayStatus.NOBEVERAGE;
    if (display.tap.keg.beverage_id) return DisplayStatus.COMPLETE;
  }
}
