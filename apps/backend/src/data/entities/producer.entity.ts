import {
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

export interface IRepositoryProducer {
  id?: string;
  name: string;

  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'producers',
})
export class Producer extends Model<IRepositoryProducer> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  name: string;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
