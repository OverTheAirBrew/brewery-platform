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
import { Tap } from './tap.entity';

export interface IRepositoryDisplay {
  id?: string;
  name: string;
  deviceCode: string;
  tap_id?: string;

  tap?: Tap;

  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'displays',
})
export class Display extends Model<IRepositoryDisplay> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  deviceCode: string;

  @Column(DataType.UUID)
  @ForeignKey(() => Tap)
  tap_id: string;

  @BelongsTo(() => Tap)
  tap?: Tap;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
