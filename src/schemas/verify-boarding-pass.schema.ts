import { z } from 'zod';

const StatusCodeSchema = z.union([z.string(), z.number()]);

export const VerifyBoardingPassResponseSchema = z
  .object({
    statusCode: StatusCodeSchema,
    message: z.string().optional(),
    data: z.unknown().optional().nullable(),
  })
  .passthrough();

export const VerifyBoardingPassValidationErrorSchema = z
  .object({
    statusCode: z.number(),
    message: z.string(),
    errors: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export type VerifyBoardingPassResponse = z.infer<typeof VerifyBoardingPassResponseSchema>;
export type VerifyBoardingPassValidationError = z.infer<typeof VerifyBoardingPassValidationErrorSchema>;
