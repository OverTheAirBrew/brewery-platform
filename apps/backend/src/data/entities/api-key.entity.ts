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

export interface IRepositoryApiKey {
  id?: string;
  key: string;
  name: string;

  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'api-keys',
})
export class ApiKey extends Model<IRepositoryApiKey> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  key: string;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
