import {
  AllowNull,
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
import { Keg } from './keg.entity';

export interface IRepositoryTap {
  id?: string;
  name: string;
  keg_id?: string;

  keg?: Keg;

  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'taps',
})
export class Tap extends Model<IRepositoryTap> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => Keg)
  keg_id: string;

  @BelongsTo(() => Keg)
  keg?: Keg;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
