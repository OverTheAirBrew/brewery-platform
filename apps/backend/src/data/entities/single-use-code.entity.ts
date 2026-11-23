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

export type RepositorySingleUseCode = {
  id?: string;

  code: string;
  expiresAt: Date;

  device_id: string;

  device?: Device;

  createdAt?: Date;
  updatedAt?: Date;
};

@Table({
  modelName: 'single-use-codes',
})
export class SingleUseCodes extends Model<RepositorySingleUseCode> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  code: string;

  @Column(DataType.DATE)
  expiresAt: Date;

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
