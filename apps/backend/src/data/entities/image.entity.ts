import {
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Beverage } from './beverage.entity';

export interface IRepositoryImage {
  id: string;
  mimetype: string;
  originalName: string;

  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'images',
})
export class Image extends Model<IRepositoryImage> {
  @PrimaryKey
  @Column(DataType.STRING)
  id: string;

  @Column(DataType.STRING)
  mimetype: string;

  @Column(DataType.STRING)
  originalName: string;

  @HasMany(() => Beverage)
  beverages?: Beverage[];

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
