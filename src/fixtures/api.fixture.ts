import { APIRequestContext } from '@playwright/test';

import { createPassengerSuccess } from '../api/passenger.api.js';
import { verifyBoardingPassSuccess } from '../api/verify-boarding-pass.api.js';
import { buildPassengerPayload } from '../factories/passenger.factory.js';
import { buildVerifyBoardingPassPayload } from '../factories/verify-boarding-pass.factory.js';
import { test as authTest } from './auth.fixture.js';
import type { VerifyBoardingPassPayload } from '../factories/verify-boarding-pass.factory.js';
import type { Passenger } from '../schemas/passenger.schema.js';

interface PreverifiedPassengerState {
  passengerId: number;
  verifyPayload: VerifyBoardingPassPayload;
  resCreatePassenger: Passenger;
}

interface ApiFixtures {
  counterContextWithPassengerID: APIRequestContext;
  passengerID: number;
  preverifiedPassenger: PreverifiedPassengerState;
}

export const test = authTest.extend<ApiFixtures>({
  counterContextWithPassengerID: async ({ counterContext }, use) => {
    await use(counterContext);
  },

  passengerID: async ({ counterContext }, use) => {
    const passenger = await createPassengerSuccess(
      counterContext,
      buildPassengerPayload({
        fullName: 'Passenger From Fixture',
      }),
    );

    await use(passenger.id);
  },

  preverifiedPassenger: async ({ counterContext }, use) => {
    const passenger = await createPassengerSuccess(
      counterContext,
      buildPassengerPayload({
        fullName: 'Passenger Preverified',
      }),
    );

    const verifyPayload = buildVerifyBoardingPassPayload();
    await verifyBoardingPassSuccess(counterContext, passenger.id, verifyPayload);

    await use({
      passengerId: passenger.id,
      resCreatePassenger: passenger,
      verifyPayload,
    });
  },
});

export { expect } from './auth.fixture.js';
