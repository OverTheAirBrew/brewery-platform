import { Inject, Injectable } from '@nestjs/common';
import { DeviceTypesSchema, LogicTypesSchema } from '@overtheairbrew/models';

import { Logic, LogicIdentifier } from '@overtheairbrew/plugins';
import { LogicTypeNotFoundError } from './errors/logic-type-not-found-error';

@Injectable()
export class LogicTypesService {
  constructor(@Inject(LogicIdentifier) private readonly logics: Logic<any>[]) {}

  async getAll() {
    return await Promise.all(
      this.logics.map((logic) => this.mapDeviceType(logic)),
    );
  }

  async getByNameRaw(name: string) {
    const logic = this.logics.find((logic) => logic.name === name);
    if (!logic) {
      throw new LogicTypeNotFoundError(name);
    }
    return logic;
  }

  private async mapDeviceType(logic: Logic<any>) {
    const properties = await logic.getConfigOptions(undefined);

    return LogicTypesSchema.parse({
      name: logic.name,
      properties,
    });
  }
}
