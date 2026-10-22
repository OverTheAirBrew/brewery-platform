import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Device } from './device.entity';

export type RepositoryActor = {
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
  modelName: 'actors',
})
export class Actor extends Model<RepositoryActor> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  type: string;

  @Column(DataType.JSON)
  config: any;

  @Column(DataType.UUID)
  @ForeignKey(() => Device)
  device_id: string;

  @BelongsTo(() => Device)
  device?: Device;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
