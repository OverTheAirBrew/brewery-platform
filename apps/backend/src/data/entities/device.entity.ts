import {
  Table,
  Model,
  Default,
  DataType,
  PrimaryKey,
  Column,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript';
import { Sensor } from './sensor.entity';
import { Actor } from './actor.entity';

export type RepositoryDevice = {
  id?: string;
  name: string;
  type: string;
  config: any;

  createdAt?: Date;
  updatedAt?: Date;
};

@Table({
  modelName: 'devices',
})
export class Device extends Model<RepositoryDevice> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  type: string;

  @Column(DataType.JSON)
  config: any;

  @HasMany(() => Sensor)
  sensors?: Sensor[];

  @HasMany(() => Actor)
  actors?: Sensor[];

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
