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
} from 'sequelize-typescript';
import { Device } from './device.entity';
import { Sensor } from './sensor.entity';

export type RepositoryTelemetry = {
  id?: string;

  device_id: string;
  sensor_id: string;

  value: number;

  device?: Device;
  sensor?: Sensor;

  createdAt?: Date;
  updatedAt?: Date;
};

@Table({
  modelName: 'telemetries',
})
export class Telemetry extends Model<RepositoryTelemetry> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.UUID)
  @ForeignKey(() => Device)
  device_id: string;

  @Column(DataType.UUID)
  @ForeignKey(() => Sensor)
  sensor_id: string;

  @Column(DataType.FLOAT)
  value: number;

  @BelongsTo(() => Device)
  device?: Device;

  @BelongsTo(() => Sensor)
  sensor?: Sensor;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
