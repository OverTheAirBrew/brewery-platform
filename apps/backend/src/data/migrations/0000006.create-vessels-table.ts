import { DataTypes, QueryInterface } from 'sequelize';

const TABLE_NAME = 'vessels';

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
    type: {
      type: DataTypes.ENUM('kettle', 'fermenter'),
      allowNull: false,
    },
    sensor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'sensors', key: 'id' },
    },
    heater_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'actors', key: 'id' },
    },
    cooler_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'actors', key: 'id' },
    },
    logicType_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logicConfig: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    autoControlEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    targetTemp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });
}

export async function down({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.dropTable(TABLE_NAME);
}
