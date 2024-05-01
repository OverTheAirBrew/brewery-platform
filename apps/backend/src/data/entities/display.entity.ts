import {
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  modelName: 'displays',
})
export class Display extends Model<{
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}> {
  @PrimaryKey
  @Column(DataType.STRING)
  id: string;

  @Column(DataType.STRING)
  name: string;

  // @HasOne(() => Tap)
  // tap: Tap;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
