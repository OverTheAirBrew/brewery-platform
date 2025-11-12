import {
  Column,
  CreatedAt,
  DataType,
  Default,
  PrimaryKey,
  Table,
  UpdatedAt,
  Model,
  NotNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Sensor } from './sensor.entity';
import { Actor } from './actor.entity';

export type RepositoryVessel = {
  id?: string;
  type: 'kettle' | 'fermenter';

  name: string;

  sensor_id?: string;
  heater_id?: string;
  cooler_id?: string;

  logicType_id?: string;
  logicConfig?: any;

  autoControlEnabled?: boolean;
  targetTemp?: number;

  createdAt?: Date;
  updatedAt?: Date;
};

@Table({
  modelName: 'vessels',
})
export class Vessel extends Model<RepositoryVessel> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.ENUM('kettle', 'fermenter'))
  type: 'kettle' | 'fermenter';

  @Column(DataType.UUID)
  @ForeignKey(() => Sensor)
  sensor_id?: string;

  @Column(DataType.UUID)
  @ForeignKey(() => Actor)
  heater_id?: string;

  @Column(DataType.UUID)
  @ForeignKey(() => Actor)
  cooler_id?: string;

  @Column(DataType.STRING)
  logicType_id?: string;

  @Column(DataType.JSON)
  logicConfig?: any;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  autoControlEnabled?: boolean;

  @Default(null)
  @Column(DataType.DECIMAL(10, 2))
  targetTemp?: number;

  @BelongsTo(() => Sensor)
  sensor?: Sensor;

  @BelongsTo(() => Actor, 'heater_id')
  heater?: Actor;

  @BelongsTo(() => Actor, 'cooler_id')
  cooler?: Actor;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
