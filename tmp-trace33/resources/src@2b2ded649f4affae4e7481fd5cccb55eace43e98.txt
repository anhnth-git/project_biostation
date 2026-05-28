import { APIRequestContext } from '@playwright/test';

import { ENV } from '../helpers/env.js';
import { LoginResponseSchema, type TokenResponseData } from '../schemas/auth.schema.js';

const assertJsonResponse = (contentType: string | undefined, action: string) => {
  if (!contentType?.includes('json')) {
    throw new Error(`${action} returned unexpected content-type: ${contentType ?? 'missing'}`);
  }
};

export async function login(request: APIRequestContext): Promise<TokenResponseData> {
  const res = await request.post('access-token/login', {
    data: {
      userName: ENV.COUNTER_USERNAME,
      password: ENV.COUNTER_PASSWORD,
    },
  });

  if (!res.ok()) {
    throw new Error(`Login failed: ${res.status()} ${await res.text()}`);
  }

  assertJsonResponse(res.headers()['content-type'], 'Login');

  const parsed = LoginResponseSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(`Login response validation failed:\n${parsed.error.message}`);
  }

  if (parsed.data.statusCode && String(parsed.data.statusCode) !== '200') {
    throw new Error(`Login rejected by server: ${parsed.data.message ?? 'Unknown error'}`);
  }

  return parsed.data.data.tokenResponse;
}

export async function getToken(request: APIRequestContext): Promise<string> {
  return (await login(request)).accessToken;
}
