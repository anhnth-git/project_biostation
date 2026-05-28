import { faker } from '@faker-js/faker';

export const getJulianDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const startOfYear = new Date(date.getFullYear(), 0, 0);

  return Math.floor((date.getTime() - startOfYear.getTime()) / 86400000)
    .toString()
    .padStart(3, '0');
};

export const buildBoardingPassBarcode = (
  offset = 0,
  departure = 'SGN',
  arrival = 'DLI',
  seat = '010B',
) => {
  const julian = getJulianDate(offset);
  const pnr = faker.string.alphanumeric({ length: 7, casing: 'upper' });

  return `M1LE/PHUC ANH         ${pnr} ${departure}${arrival}VN 1381 ${julian}Y${seat}0002  23>118   6${julian}BVN 00000000000000012299`;
};
