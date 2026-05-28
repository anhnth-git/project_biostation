import { expect, test } from '../../../src/fixtures/api.fixture';
import { PassengerApi } from '../../../src/api/passenger.api';
import { data } from './create-passenger.data';

test.describe('API Create Passenger', () => {
  let passengerApi: PassengerApi;

  test.beforeEach(async ({ counterContext }) => {
    passengerApi = new PassengerApi(counterContext);
  });

  test('Created Passenger -01: Tạo passenger thành công', async () => {
    const res = await passengerApi.createSuccess(data.datacase1);
    expect(res.fullName).toContain(data.datacase1.fullName);
  });

  test('Created Passenger -02: Tạo Passenger thành công với Giới tính đặc biệt (gender: "X") ', async () => {
    const res = await passengerApi.createSuccess(data.datacase2);
    expect(res.fullName).toContain(data.datacase2.fullName);
  });

  test('Created Passenger -03: Tạo Passenger có idNumber trùng lặp với bản ghi đã có', async () => {
    const res = await passengerApi.createSuccess(data.datacase1);
    expect(res.fullName).toContain(data.datacase1.fullName);
  });

  test('Created Passenger -04: Missing field - Không truyền idNumber', async () => {
    const res = await passengerApi.create(data.datacase4);

    expect(res.status()).toEqual(200);
    const responseJson = await res.json();
    expect(responseJson.statusCode).toContain('217');
    expect(responseJson.message).toContain('Lỗi hệ thống.');
  });

  test('Created Passenger -05: Missing field - Không truyền fullName', async () => {
    await passengerApi.createInvalid(data.datacase5);
  });

  test('Created Passenger -06: Data type mismatch - checkinType truyền chuỗi thay vì số', async () => {
    await passengerApi.createInvalid(data.datacase6);
  });

  test('Created Passenger -07: Invalid enrollChannel format', async () => {
    await passengerApi.createInvalid(data.datacase7);
  });

  test('Created Passenger -08: Invalid idNumber  format - khác string', async () => {
    await passengerApi.createInvalid(data.datacase8);
  });

  test('Created Passenger -09: Invalid mrz  format - khác string', async () => {
    await passengerApi.createInvalid(data.datacase9);
  });

  test('Created Passenger -10: Invalid fullName  format - khác string', async () => {
    await passengerApi.createInvalid(data.datacase10);
  });

  test('Created Passenger -11: Invalid documentType  format - khác số', async () => {
    await passengerApi.createInvalid(data.datacase11);
  });

  test('Created Passenger -12: Invalid birthDate  format - khác dịnh dạng ngày tháng năm', async () => {
    await passengerApi.createInvalid(data.datacase12);
  });

  test('Created Passenger -13: Invalid expiryDate format - khác dịnh dạng ngày tháng năm', async () => {
    await passengerApi.createInvalid(data.datacase13);
  });

  test('Created Passenger -14: Invalid termId  format - khác dịnh dạng số', async () => {
    await passengerApi.createInvalid(data.datacase14);
  });

  test('Created Passenger -15: Invalid gender  format - khác dịnh dạng string', async () => {
    await passengerApi.createInvalid(data.datacase15);
  });

  test('Created Passenger -16: Invalid countryCode  format - khác dịnh dạng string', async () => {
    await passengerApi.createInvalid(data.datacase16);
  });

  test('Created Passenger -17: Ngày hết hạn giấy tờ (expiryDate) ở quá khứ ', async () => {
    await passengerApi.create(data.datacase17);
  });

  test('Created Passenger -18: Ngày sinh (birthDate) ở tương lai ', async () => {
    await passengerApi.create(data.datacase18);
  });

  test('Created Passenger -19: Mass Assignment (Tiêm field lạ: role, isVerified)', async () => {
    const res = await passengerApi.createSuccess(data.datacase19);
    expect(res.fullName).toContain(data.datacase19.fullName);
  });

  test('Created Passenger -20: Payload quá lớn (rfidPhoto)', async () => {
    const res = await passengerApi.createSuccess(data.datacase20);
    expect(res.fullName).toContain(data.datacase20.fullName);
  });

  test('Created Passenger -21: không truyền token', async ({ request }) => {
    const res = await request.post('passenger/create', {
      data: data.datacase1,
    });
    expect(res.status()).toEqual(401);
  });

  test('Created Passenger -22: fullName quá dài (>200 ký tự)', async () => {
    const res = await passengerApi.create(data.datacase22);
    expect(res.status()).toEqual(200);
    const resJson = await res.json();

    expect(resJson.statusCode).toContain('217');
    expect(resJson.message).toContain('Lỗi hệ thống.');
  });

  test('Created Passenger -23: Bulk 1000 records vượt limit', async () => {
    const res = await passengerApi.create(data.datacase23);
    expect(res.status()).toEqual(200);
    const resJson = await res.json();

    expect(resJson.statusCode).toContain('217');
    expect(resJson.message).toContain('Lỗi hệ thống.');
  });

  test('Created Passenger -24: Kiểm tra khi nhập sai path', async ({ request }) => {
    const res = await request.post('passenger/createe', {
      data: data.datacase1,
    });
    expect(res.status()).toEqual(404);
  });

  test('Created Passenger -25: Gọi Method khác POST', async ({ request }) => {
    const res = await request.get('passenger/create');

    expect(res.status()).toEqual(405);
  });

  test('Created Passenger -28: Body JSON sai cú pháp (thừa dấu })', async ({ counterContext }) => {
    const res = await counterContext.post('passenger/create', {
      data: '{"checkinType": 1, "enrollChannel": 1, "idNumber": "123456789"}}',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toEqual(400);
  });
});
