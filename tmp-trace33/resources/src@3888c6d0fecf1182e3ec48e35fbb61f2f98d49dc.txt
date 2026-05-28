import { APIRequestContext, test as base } from '@playwright/test';

import { getToken } from '../api/auth.api.js';
import { ENV } from '../helpers/env.js';

interface AuthFixtures {
  counterToken: string;
  counterContext: APIRequestContext;
}

export const test = base.extend<AuthFixtures>({
  counterToken: async ({ request }, use) => {
    await use(await getToken(request));
  },

  counterContext: async ({ playwright, counterToken }, use) => {
    const context = await playwright.request.newContext({
      baseURL: ENV.BASE_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${counterToken}`,
      },
    });

    await use(context);
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
