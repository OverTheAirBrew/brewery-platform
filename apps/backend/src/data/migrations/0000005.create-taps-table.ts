import { DataTypes, QueryInterface } from 'sequelize';

const TABLE_NAME = 'taps';

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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    keg_id: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      references: { model: 'kegs', key: 'id' },
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
