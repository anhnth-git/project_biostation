import { expect, test } from '../../src/request/fixtures';
import { createToken } from './create-token.api';
import { buildFacePhotoBase64 } from './create-token.data';



test.describe("API Create Token", () => {
  let createdToken: createToken;

  test.beforeEach(async ({ counterContext, preapicreattoken }) => {
    createdToken = new createToken(counterContext, preapicreattoken.passengerId);
  });

  test('Create Token -01: Tạo token sau khi passenger đã verify boarding pass', async ({ preapicreattoken }) => {
    const responseJson = await createdToken.createSuccess({
      facePhoto: buildFacePhotoBase64(0),
    });
    const { enrollChannel, ...expectedPassenger } = preapicreattoken.resCreatePassenger;

    expect(responseJson.data.passengerId).toEqual(preapicreattoken.passengerId);
    expect(responseJson.data.passenger).toMatchObject(expectedPassenger);
    console.log(responseJson);
    expect(responseJson.data.boardingPass).

    

  });
});



