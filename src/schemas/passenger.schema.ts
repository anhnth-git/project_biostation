import { z } from 'zod';

const StatusCodeSchema = z.union([z.string(), z.number()]);

export const PassengerSchema = z
  .object({
    id: z.number(),
    idNumber: z.string(),
    fullName: z.string(),
    birthDate: z.string(),
    expiryDate: z.string(),
  })
  .passthrough();

export const PassengerEnvelopeSchema = z
  .object({
    statusCode: StatusCodeSchema,
    message: z.string().optional(),
    data: z.unknown().optional().nullable(),
  })
  .passthrough();

export const PassengerSuccessResponseSchema = z
  .object({
    statusCode: StatusCodeSchema,
    message: z.string().optional(),
    data: PassengerSchema,
  })
  .passthrough();

export const PassengerValidationErrorSchema = z
  .object({
    statusCode: z.number(),
    message: z.string(),
    errors: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export type Passenger = z.infer<typeof PassengerSchema>;
export type PassengerEnvelope = z.infer<typeof PassengerEnvelopeSchema>;
export type PassengerSuccessResponse = z.infer<typeof PassengerSuccessResponseSchema>;
export type PassengerValidationError = z.infer<typeof PassengerValidationErrorSchema>;
