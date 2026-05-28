import { z } from 'zod';

export const LoginResponseSchema = z
  .object({
    statusCode: z.union([z.string(), z.number()]).optional(),
    message: z.string().optional(),
    data: z.object({
      tokenResponse: z.object({
        accessToken: z.string(),
      }),
    }),
  })
  .passthrough();

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type TokenResponseData = LoginResponse['data']['tokenResponse'];
