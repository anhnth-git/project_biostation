import { expect, test } from '../../../src/fixtures/api.fixture';
import { TokenApi } from '../../../src/api/token.api';
import { VerifyBoardingPassApi } from '../../../src/api/verify-boarding-pass.api';
import { data } from './create-token.data';

const DUPLICATE_FACE_STATUS_CODE = '[242]';

const createTokenWithFreshFace = async (tokenApi: TokenApi, attempts = 5) => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await tokenApi.createSuccess(data.datacase1);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes(DUPLICATE_FACE_STATUS_CODE)) {
        throw error;
      }

      lastError = error;
    }
  }

  throw lastError ?? new Error('Create token failed after exhausting fresh face-photo attempts');
};

test.describe('API Create Token', () => {
  test.describe.configure({ mode: 'serial' });
  
  let tokenApi: TokenApi;

  test.beforeEach(async ({ counterContext, preverifiedPassenger }) => {
    tokenApi = new TokenApi(counterContext, preverifiedPassenger.passengerId);
  });

  test('Create Token -01: Tạo token sau khi passenger đã verify boarding pass', async ({ preverifiedPassenger }) => {
    const responseJson = await createTokenWithFreshFace(tokenApi);
    const { enrollChannel, ...expectedPassenger } = preverifiedPassenger.resCreatePassenger;

    expect(responseJson.data.passengerId).toEqual(preverifiedPassenger.passengerId);
    expect(responseJson.data.passenger).toMatchObject(expectedPassenger);
    expect(responseJson.data.boardingPass.pdf417raw).toEqual(preverifiedPassenger.verifyPayload.barcode);
  });

  test.describe('Create Token -02 timeout scope', () => {
    test.describe.configure({ timeout: 120000 });

    test('Create Token -02: Passenger thứ 2 verify lại vé cũ trả về 546', async ({ counterContext, passengerID, preverifiedPassenger }) => {
      await createTokenWithFreshFace(tokenApi);

      const verifyBoardingPassApi = new VerifyBoardingPassApi(counterContext, passengerID);
      const responseJson = await verifyBoardingPassApi.verify(preverifiedPassenger.verifyPayload);

      expect(String(responseJson.statusCode)).toBe('546');
    });
  });
});
