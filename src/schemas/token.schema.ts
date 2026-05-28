import { z } from 'zod';

import { PassengerSchema } from './passenger.schema.js';

const StatusCodeSchema = z.union([z.string(), z.number()]);

export const TokenSchema = z
  .object({
    passengerId: z.number(),
    passenger: PassengerSchema,
    boardingPass: z
      .object({
        pdf417raw: z.string(),
      })
      .passthrough(),
  })
  .passthrough();

export const TokenEnvelopeSchema = z
  .object({
    statusCode: StatusCodeSchema,
    message: z.string().optional(),
    data: z.unknown().optional().nullable(),
  })
  .passthrough();

export const TokenResponseSchema = z
  .object({
    statusCode: StatusCodeSchema,
    message: z.string().optional(),
    data: TokenSchema,
  })
  .passthrough();

export type Token = z.infer<typeof TokenSchema>;
export type TokenEnvelope = z.infer<typeof TokenEnvelopeSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
