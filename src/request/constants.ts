import { faker } from '@faker-js/faker';

// Helper: generate ngày quá khứ (YYYY-MM-DD), mặc định lùi 1 ngày
const getPastDate = (daysAgo = 1) => new Date(Date.now() - daysAgo * 864e5).toISOString().split('T')[0];

// Helper: generate ngày tương lai (YYYY-MM-DD), mặc định cộng 1 ngày
const getFutureDate = (daysAhead = 1) => new Date(Date.now() + daysAhead * 864e5).toISOString().split('T')[0];

const getJulianDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - startOfYear.getTime()) / 86400000).toString().padStart(3, '0');
};

const buildBoardingPassBarcode = (offset = 0, departure = 'SGN', arrival = 'DLI', seat = '010B') => {
  const julian = getJulianDate(offset);
  const pnr = faker.string.alphanumeric({ length: 7, casing: 'upper' });
  return `M1LE/PHUC ANH         ${pnr} ${departure}${arrival}VN 1381 ${julian}Y${seat}0002  23>118   6${julian}BVN 00000000000000012299`;
};

export { getPastDate, getFutureDate, getJulianDate, buildBoardingPassBarcode };






