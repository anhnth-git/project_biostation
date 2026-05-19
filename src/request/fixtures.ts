import { test as base, APIRequestContext, expect } from '@playwright/test';
import { buildBoardingPassBarcode } from './constants.js';
import { getToken } from './loginGentoken.js';

/** 
* Auth fixture that: 
* 1. Log in as account couter
* 2. Provides an anthencited APIRequestContext with Bearer token.
* 3. Clean up after tests
 */

const USER_MANAGEMENT_BASE = 'access-token/login';

interface PreverifiedPassengerState {
  passengerId: number;
  verifyPayload: {
    barcode: string;
    computerName: string;
    nameIdentity: string;
    verifyBoardingPass: string;
  };
  resCreatePassenger: any;
}

interface AuthFixtures {
  /** Authen request context with counter */
  counterContext: APIRequestContext;
  counterToken: string;


  /** Authen request context with Counter and create passenger, passengerID with boardingpass */
  counterContextWithPassengerID: APIRequestContext;
  passengerID: number;
  counterTokenWithPassengerID: string;
  preapicreattoken: PreverifiedPassengerState;

}

export const test = base.extend<AuthFixtures>({

  counterToken: async ({ request }, use) => {
    await use(await getToken(request));
  },

  counterContext: async ({ playwright, counterToken }, use) => {

    const context = await playwright.request.newContext({
      baseURL: 'http://10.0.229.130:8086/api/v2/',
      extraHTTPHeaders: {
        'Authorization': `Bearer ${counterToken}`
      }
    });

    await use(context);
    await context.dispose();
  },


  counterTokenWithPassengerID: async ({ request }, use) => {
    await use(await getToken(request));
  },

  counterContextWithPassengerID: async ({ playwright, counterTokenWithPassengerID }, use) => {

    const context = await playwright.request.newContext({
      baseURL: 'http://10.0.229.130:8086/api/v2/',
      extraHTTPHeaders: {
        'Authorization': `Bearer ${counterTokenWithPassengerID}`
      }
    });

    await use(context);
    await context.dispose();
  },

  // Fixture tự động tạo 1 passenger và trả về ID
  passengerID: async ({ counterContextWithPassengerID }, use) => {
    const createResponse = await counterContextWithPassengerID.post(`passenger/create`, {
      data: {
        "checkinType": 1,
        "enrollChannel": 2,
        "idNumber": `FIX${Date.now()}`,
        "mrz": "219837647849",
        "documentType": 0,
        "fullName": "Passenger From Fixture",
        "birthDate": "1999-11-23",
        "expiryDate": "2038-11-23",
        "termId": 0,
        "gender": "M",
        "countryCode": "string"
      }
    });

    const body = await createResponse.json();
    const newPassengerId = body.data.id;

    await use(newPassengerId);
  },

  preapicreattoken: async ({ counterContext }, use) => {
    const createResponse = await counterContext.post(`passenger/create`, {
      data: {
        "checkinType": 1,
        "enrollChannel": 2,
        "idNumber": `FIX${Date.now()}`,
        "mrz": "219837647849",
        "documentType": 0,
        "fullName": "Passenger Preverified",
        "birthDate": "1999-11-23",
        "expiryDate": "2038-11-23",
        "termId": 0,
        "gender": "M",
        "countryCode": "string"
      }
    });

    expect(createResponse.status()).toEqual(200);
    const createPassengerBody = await createResponse.json();
    expect(createPassengerBody.statusCode).toContain('200');
    expect(createPassengerBody.data).toBeTruthy();


    const verifyPayload = {
      barcode: buildBoardingPassBarcode(),
      computerName: 'string',
      nameIdentity: 'string',
      verifyBoardingPass: 'string'
    };

    const verifyResponse = await counterContext.post(`acv/verify-boarding-pass`, {
      data: {
        ...verifyPayload,
        passengerId: createPassengerBody.data.id,
      }
    });

    expect(verifyResponse.status()).toEqual(200);
    const verifyBody = await verifyResponse.json();
    expect(verifyBody.statusCode).toContain('200');
    expect(verifyBody.data).toBeTruthy();

    await use({
      passengerId: createPassengerBody.data.id,
      resCreatePassenger: createPassengerBody.data,
      verifyPayload,
    });
  },
});






export { expect } from '@playwright/test';
