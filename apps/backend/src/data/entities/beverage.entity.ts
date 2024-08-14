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
import { Producer } from './producer.entity';

export interface IRepositoryBeverage {
  id?: string;
  name: string;
  style: string;
  abv: number;
  description: string;
  producer_id: string;

  producer?: Producer;

  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'beverages',
})
export class Beverage extends Model<IRepositoryBeverage> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  style: string;

  @Column(DataType.DECIMAL(10, 2))
  abv: number;

  @Column(DataType.STRING)
  description: string;

  @Column(DataType.UUID)
  @ForeignKey(() => Producer)
  producer_id: string;

  @BelongsTo(() => Producer)
  producer?: Producer;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
