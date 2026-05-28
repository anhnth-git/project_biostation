import { buildBoardingPassBarcode } from '../helpers/boarding-pass.js';

export interface VerifyBoardingPassPayload {
  barcode?: string | boolean | string[];
  computerName?: string | boolean;
  nameIdentity?: string | boolean;
  verifyBoardingPass?: string | boolean;
  passengerId?: string | number;
  [key: string]: unknown;
}

export const buildVerifyBoardingPassPayload = (
  overrides: Partial<VerifyBoardingPassPayload> = {},
): VerifyBoardingPassPayload => {
  return {
    barcode: buildBoardingPassBarcode(),
    computerName: 'string',
    nameIdentity: 'string',
    verifyBoardingPass: 'string',
    ...overrides,
  };
};
