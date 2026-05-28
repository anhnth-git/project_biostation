import { expect, test } from '../../../src/fixtures/api.fixture';
import { VerifyBoardingPassApi } from '../../../src/api/verify-boarding-pass.api';
import { data } from './verify-boarding-pass.data';

test.describe('API Verify Boardingpass', () => {
  let verifyBoardingPassApi: VerifyBoardingPassApi;

  test.beforeEach(async ({ counterContextWithPassengerID, passengerID }) => {
    verifyBoardingPassApi = new VerifyBoardingPassApi(counterContextWithPassengerID, passengerID);
  });

  test('Verify BoardinngPass -01: Verify thành công', async () => {
    await verifyBoardingPassApi.verifySuccess(data.datacase1);
  });

  test('Verify BoardinngPass -02: Trường hợp barcode trùng với barcode trước đó ', async () => {
    const requestData = { ...data.datacase2 };
    await verifyBoardingPassApi.verifySuccess(requestData);
    const res = await verifyBoardingPassApi.verify(requestData);

    expect(res.statusCode).toContain('200');
    expect(res.data).toBeTruthy();
  });

  test('Verify BoardinngPass -03: Trường hợp thẻ lên tày bay có ngày bay không hợp lệ (N-2)  ', async () => {
    await verifyBoardingPassApi.verifyStatusCode(data.datacase3, '544', 'Ngày bay không hợp lệ. Vui lòng kiểm tra lại');
  });

  test('Verify BoardinngPass -04: Trường hợp thẻ lên tày bay có ngày bay không hợp lệ (N+2)  ', async () => {
    await verifyBoardingPassApi.verifyStatusCode(data.datacase4, '544', 'Ngày bay không hợp lệ. Vui lòng kiểm tra lại');
  });

  test('Verify BoardinngPass -05: Trường hợp thẻ lên tày bay có ngày bay hợp lệ (N+1)', async () => {
    await verifyBoardingPassApi.verifySuccess(data.datacase5);
  });

  test('Verify BoardinngPass -06: Trường hợp thẻ lên tày bay có ngày bay hợp lệ (N-1)', async () => {
    await verifyBoardingPassApi.verifySuccess(data.datacase6);
  });

  test('Verify BoardinngPass -07: Thẻ lên tàu bay không hợp lệ ( không đúng chuẩn IATA) ', async () => {
    await verifyBoardingPassApi.verifyStatusCode(data.datacase7, '556', 'Định dạng mã vạch không hợp lệ');
  });

  test('Verify BoardinngPass -08: Thẻ lên tàu bay có cảng đi khác với cảng đang cấu hình Status code = 548 ', async () => {
    await verifyBoardingPassApi.verifyStatusCode(data.datacase8, '548', 'Hành trình không hợp lệ');
  });

  test('Verify BoardinngPass -09: Thẻ lên tàu bay có cảng đến khác với các cảng nội địa statusCode = 545', async () => {
    await verifyBoardingPassApi.verifyStatusCode(data.datacase9, '545', 'Thẻ lên tàu bay quốc tế không được chấp nhận');
  });

  test('Verify BoardinngPass -10: Thẻ lên tàu bay là trẻ sơ sinh INFANT (Giá trị số ghế trong thẻ lên tàu bay là trống, hoặc chỉ là số, hoặc chỉ là chữ)', async () => {
    await verifyBoardingPassApi.verifyStatusCode(data.datacase10, '540', 'Hành khách là trẻ em!');
  });

  test('Verify BoardinngPass -11: Kiểm tra forrmat trường barcode khác string', async () => {
    const res = await verifyBoardingPassApi.verifyValidation(data.datacase11);
    expect(res.status()).toEqual(400);
    const resJson = await res.json();
    expect(resJson.statusCode).toEqual(400);
    expect(resJson.message).toContain('One or more errors occurred!');

    const getBarcodeTypeError = (barcode: any): string => {
      const type = typeof barcode;
      const typeName = type === 'number'
        ? 'Number'
        : type === 'boolean'
          ? (barcode ? 'True' : 'False')
          : type.charAt(0).toUpperCase() + type.slice(1);

      return `Cannot get the value of a token type '${typeName}' as a string.`;
    };

    expect(resJson.errors.barcode).toContain(getBarcodeTypeError(data.datacase11.barcode));
  });

  test('Verify BoardinngPass -12: Kiểm tra forrmat trường passengerId khác number', async () => {
    const res = await verifyBoardingPassApi.verifyRaw(data.datacase12);
    expect(res.status()).toEqual(400);
    const resJson = await res.json();
    expect(resJson.statusCode).toEqual(400);
    expect(resJson.message).toContain('One or more errors occurred!');
  });

  test('Verify BoardinngPass -13: Kiểm tra forrmat trường computerName khác string', async () => {
    await verifyBoardingPassApi.verifyHttp400(data.datacase13);
  });

  test('Verify BoardinngPass -14: Kiểm tra forrmat trường nameIdentity khác string', async () => {
    await verifyBoardingPassApi.verifyHttp400(data.datacase14);
  });

  test('Verify BoardinngPass -15: Kiểm tra forrmat trường verifyBoardingPass khác string', async () => {
    await verifyBoardingPassApi.verifyHttp400(data.datacase15);
  });

  test('Verify BoardinngPass -16: Kiểm tra trường bắt buộc barcode hoặc barcode null ', async () => {
    await verifyBoardingPassApi.verifyStatusCode(data.datacase16, '556', 'Định dạng mã vạch không hợp lệ');
  });

  test('Verify BoardinngPass -17: Kiểm tra trường bắt buộc passengerId ', async () => {
    const res = await verifyBoardingPassApi.verifyRaw(data.datacase17);
    expect(res.status()).toEqual(200);
    const resJson = await res.json();
    expect(resJson.statusCode).toContain('213');
    expect(resJson.message).toContain('Không tìm thấy dữ liệu');
    expect(resJson.data).not.toBeTruthy();
  });

  test('Verify BoardinngPass -18: Mass Assignment (Tiêm field lạ: role, isVerified) ', async () => {
    await verifyBoardingPassApi.verifySuccess(data.datacase18);
  });

  test('Verify BoardinngPass -19: không truyền token', async ({ request }) => {
    const res = await request.post('acv/verify-boarding-pass', {
      data: data.datacase1,
    });
    expect(res.status()).toEqual(401);
  });

  test('Verify BoardinngPass -20: Kiểm tra khi nhập sai path', async ({ request }) => {
    const res = await request.post('acv/verify-boarding-passs', {
      data: data.datacase1,
    });
    expect(res.status()).toEqual(404);
  });

  test('Verify BoardinngPass -21: Gọi Method khác POST', async ({ request }) => {
    const res = await request.get('acv/verify-boarding-pass');
    expect(res.status()).toEqual(405);
  });

  test('Verify BoardinngPass -22: Sai cấu trúc bản tin', async () => {
    await verifyBoardingPassApi.verifyHttp400(data.datacase22);
  });
});
