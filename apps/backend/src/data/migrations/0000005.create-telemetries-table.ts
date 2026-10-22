import { DataTypes, QueryInterface } from 'sequelize';

const TABLE_NAME = 'telemetries';

export async function up({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.createTable(TABLE_NAME, {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    device_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'devices', key: 'id' },
    },
    sensor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'sensors', key: 'id' },
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });

  await queryInterface.addIndex(TABLE_NAME, {
    fields: ['device_id', 'sensor_id'],
    name: 'telemetries_device_id_sensor_id_idx',
    unique: false,
  });
}

export async function down({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.removeIndex(
    TABLE_NAME,
    'telemetries_device_id_sensor_id_idx',
  );
  await queryInterface.dropTable(TABLE_NAME);
}
