import { DataTypes, QueryInterface } from 'sequelize';

const TABLE_NAME = 'kegs';

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
    beverage_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'beverages', key: 'id' },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('IN_STOCK', 'IN_USE', 'EMPTY'),
      defaultValue: 'IN_STOCK',
      allowNull: true,
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
