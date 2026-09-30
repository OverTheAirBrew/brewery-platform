import {
  Table,
  Model,
  Default,
  DataType,
  PrimaryKey,
  Column,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  ForeignKey,
  HasMany,
} from 'sequelize-typescript';
import { Device } from './device.entity';
import { Telemetry } from './telemetry.entity';

export type RepositorySensor = {
  id?: string;
  name: string;
  type: string;
  config: any;

  device_id: string;

  device?: Device;

  createdAt?: Date;
  updatedAt?: Date;
};

@Table({
  modelName: 'sensors',
})
export class Sensor extends Model<RepositorySensor> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  type: string;

  @Column(DataType.UUID)
  @ForeignKey(() => Device)
  device_id: string;

  @Column(DataType.JSON)
  config: any;

  @BelongsTo(() => Device)
  device?: Device;

  @HasMany(() => Telemetry, 'sensor_id')
  telemetry?: Telemetry[];

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
