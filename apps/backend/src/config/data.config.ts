import z from 'zod';

const DatabaseTypeEnum = z.enum(['local', 'mysql']);

const LocalDatabaseSchema = z.object({
  DATABASE_TYPE: z.literal(DatabaseTypeEnum.enum.local),
  DATABASE_NAME: z.string(),
  MIGRATE: z.string().optional(),
});

const MysqlDatabaseSchema = z.object({
  DATABASE_TYPE: z.literal(DatabaseTypeEnum.enum.mysql),
  MYSQL_URL: z.url().min(3),
  MIGRATE: z.string().optional(),
});

export const DatabaseSchema = z.discriminatedUnion('DATABASE_TYPE', [
  LocalDatabaseSchema,
  MysqlDatabaseSchema,
]);
