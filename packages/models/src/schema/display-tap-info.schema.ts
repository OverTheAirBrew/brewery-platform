import { z } from 'zod';

export const DisplayTapInformationUnauthenticatedSchema = z.object({
  status: z.literal('UNAUTHENTICATED'),
  qrCode: z.string(),
  loginId: z.string(),
});

export const DisplayTapInformationSchema = z.object({
  status: z.enum([
    'UNREGISTERED',
    'TAPUNASSIGNED',
    'NOBEVERAGE',
    'COMPLETE',
    'UNKNOWN',
  ]),
  beverage: z
    .object({
      id: z.string(),
      name: z.string(),
      style: z.string(),
      abv: z.number(),
      description: z.string(),
      producer: z.string(),
    })
    .optional(),
});
