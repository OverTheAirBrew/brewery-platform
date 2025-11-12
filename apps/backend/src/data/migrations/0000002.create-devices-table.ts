import { randomUUID } from 'node:crypto';
import { DataTypes, QueryInterface } from 'sequelize';

const TABLE_NAME = 'devices';

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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    config: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });

  await queryInterface.bulkInsert(TABLE_NAME, [
    {
      id: randomUUID(),
      name: 'Local Device',
      type: 'LocalDevice',
      config: '{}',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down({
  context: queryInterface,
}: {
  context: QueryInterface;
}) {
  await queryInterface.dropTable(TABLE_NAME);
}
