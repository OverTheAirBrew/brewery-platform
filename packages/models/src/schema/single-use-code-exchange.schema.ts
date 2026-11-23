import z from 'zod';

export const SingleUseCodeExchangeSchema = z.object({
  code: z.string().length(9), // this is 9 as the code is 8 but it includes the hyphen
});

export const SingleUseCodeExchangeResponse = z.object({
  version: z.number().max(1),
  deviceId: z.uuid(),
  mqtt: z.object({
    host: z.hostname(),
    port: z.number(),
    tls: z.boolean().default(false),
    password: z.string(),
  }),
});
