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

export interface IRepositoryDisplayLogin {
  id?: string;
  serial: string;
  authenticated?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'display-logins',
})
export class DisplayLogin extends Model<IRepositoryDisplayLogin> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  serial: string;

  @Column(DataType.BOOLEAN)
  authenticated: boolean;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
