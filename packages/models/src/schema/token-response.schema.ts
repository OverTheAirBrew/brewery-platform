import { z } from 'zod';

export const TokenResponse = z.object({
  sub: z.number(),
  username: z.string(),
  emailHash: z.string(),
  token: z.string(),
});
