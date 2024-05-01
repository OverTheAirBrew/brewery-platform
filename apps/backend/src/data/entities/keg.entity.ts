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
import { Beverage } from './beverage.entity';

export interface IRepositoryKeg {
  id?: string;
  beverage_id: string;
  type: string;
  status: 'IN_STOCK' | 'IN_USE' | 'EMPTY';

  beverage?: Beverage;

  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'kegs',
})
export class Keg extends Model<IRepositoryKeg> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.UUID)
  @ForeignKey(() => Beverage)
  beverage_id: string;

  @Column(DataType.STRING)
  type: string;

  @Default('IN_STOCK')
  @Column(DataType.ENUM('IN_STOCK', 'IN_USE', 'EMPTY'))
  status: 'IN_STOCK' | 'IN_USE' | 'EMPTY';

  @BelongsTo(() => Beverage)
  beverage?: Beverage;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
