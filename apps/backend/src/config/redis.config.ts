import z from 'zod';

export const RedisSchema = z.object({
  REDIS_URL: z.string().url().min(3),
  REDIS_PREFIX: z.string().optional(),
});
