import { faker } from '@faker-js/faker';

export interface PassengerPayload {
  checkinType: number | string;
  enrollChannel: number | string;
  idNumber?: string | number;
  mrz?: string | number;
  documentType?: number | string;
  fullName?: string | number;
  birthDate?: string;
  expiryDate?: string;
  termId?: number | string;
  gender?: string | number;
  countryCode?: string;
  [key: string]: unknown;
}

export const buildPassengerPayload = (overrides: Partial<PassengerPayload> = {}): PassengerPayload => {
  return {
    checkinType: 1,
    enrollChannel: 2,
    idNumber: `FIX${Date.now()}${faker.string.numeric(4)}`,
    mrz: '219837647849',
    documentType: 0,
    fullName: 'Passenger From Factory',
    birthDate: '1999-11-23',
    expiryDate: '2038-11-23',
    termId: 0,
    gender: 'M',
    countryCode: 'string',
    ...overrides,
  };
};

export const buildPassengerBatch = (count: number): PassengerPayload[] => {
  return Array.from({ length: count }, (_, index) => {
    const sequence = String(index + 1).padStart(4, '0');

    return buildPassengerPayload({
      idNumber: `7644358${sequence}`,
      fullName: `Test User ${index + 1}`,
      birthDate: '1990-01-01',
      expiryDate: '2030-01-01',
      gender: (index + 1) % 2 === 0 ? 'F' : 'M',
      countryCode: 'VN',
    });
  });
};
