import { APIRequestContext } from '@playwright/test';

import {
  VerifyBoardingPassResponseSchema,
  VerifyBoardingPassValidationErrorSchema,
  type VerifyBoardingPassResponse,
  type VerifyBoardingPassValidationError,
} from '../schemas/verify-boarding-pass.schema.js';

export type VerifyBoardingPassRequestBody = Record<string, unknown>;

const assertJsonResponse = (contentType: string | undefined, action: string) => {
  if (!contentType?.includes('json')) {
    throw new Error(`${action} returned unexpected content-type: ${contentType ?? 'missing'}`);
  }
};

export const createVerifyBoardingPassPayload = (
  passengerId: number,
  body: VerifyBoardingPassRequestBody,
) => {
  return { ...body, passengerId };
};

export const postVerifyBoardingPass = (request: APIRequestContext, body: VerifyBoardingPassRequestBody) => {
  return request.post('acv/verify-boarding-pass', {
    data: body,
  });
};

export async function verifyBoardingPass(
  request: APIRequestContext,
  passengerId: number,
  body: VerifyBoardingPassRequestBody,
): Promise<VerifyBoardingPassResponse> {
  const res = await postVerifyBoardingPass(request, createVerifyBoardingPassPayload(passengerId, body));

  if (!res.ok()) {
    throw new Error(`Verify boarding pass failed: ${res.status()} ${await res.text()}`);
  }

  assertJsonResponse(res.headers()['content-type'], 'Verify boarding pass');

  const parsed = VerifyBoardingPassResponseSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(`Verify boarding pass response validation failed:\n${parsed.error.message}`);
  }

  return parsed.data;
}

export async function verifyBoardingPassSuccess(
  request: APIRequestContext,
  passengerId: number,
  body: VerifyBoardingPassRequestBody,
): Promise<VerifyBoardingPassResponse> {
  const response = await verifyBoardingPass(request, passengerId, body);

  if (String(response.statusCode) !== '200') {
    throw new Error(`Verify boarding pass rejected by server: ${response.message ?? 'Unknown error'}`);
  }

  if (!response.data) {
    throw new Error('Verify boarding pass returned empty data');
  }

  return response;
}

export async function verifyBoardingPassValidationError(
  request: APIRequestContext,
  passengerId: number,
  body: VerifyBoardingPassRequestBody,
): Promise<VerifyBoardingPassValidationError> {
  const res = await postVerifyBoardingPass(request, createVerifyBoardingPassPayload(passengerId, body));

  if (res.status() !== 400) {
    throw new Error(`Expected verify boarding pass validation error: ${res.status()} ${await res.text()}`);
  }

  assertJsonResponse(res.headers()['content-type'], 'Verify boarding pass validation');

  const parsed = VerifyBoardingPassValidationErrorSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(`Verify boarding pass validation response failed:\n${parsed.error.message}`);
  }

  return parsed.data;
}

export class VerifyBoardingPassApi {
  requestContext: APIRequestContext;
  passengerId: number;

  constructor(request: APIRequestContext, passengerId: number) {
    this.requestContext = request;
    this.passengerId = passengerId;
  }

  createPayload(body: VerifyBoardingPassRequestBody) {
    return createVerifyBoardingPassPayload(this.passengerId, body);
  }

  postVerify(body: VerifyBoardingPassRequestBody) {
    return postVerifyBoardingPass(this.requestContext, body);
  }

  async verify(body: VerifyBoardingPassRequestBody) {
    return verifyBoardingPass(this.requestContext, this.passengerId, body);
  }

  async verifySuccess(body: VerifyBoardingPassRequestBody) {
    return verifyBoardingPassSuccess(this.requestContext, this.passengerId, body);
  }

  async verifyStatusCode(body: VerifyBoardingPassRequestBody, statusCode: string, message: string) {
    const response = await this.verify(body);

    if (String(response.statusCode) !== statusCode) {
      throw new Error(`Expected statusCode ${statusCode}, received ${String(response.statusCode)}`);
    }

    if (!response.message?.includes(message)) {
      throw new Error(`Expected message to contain "${message}", received "${response.message ?? ''}"`);
    }

    if (response.data) {
      throw new Error('Expected verify boarding pass business error to return empty data');
    }

    return response;
  }

  verifyValidation(body: VerifyBoardingPassRequestBody) {
    return this.postVerify(this.createPayload(body));
  }

  verifyRaw(body: VerifyBoardingPassRequestBody) {
    return this.postVerify(body);
  }

  async verifyHttp400(body: VerifyBoardingPassRequestBody) {
    const res = await this.postVerify(this.createPayload(body));

    if (res.status() !== 400) {
      throw new Error(`Expected HTTP 400, received ${res.status()} ${await res.text()}`);
    }

    assertJsonResponse(res.headers()['content-type'], 'Verify boarding pass HTTP 400');

    const parsed = VerifyBoardingPassValidationErrorSchema.safeParse(await res.json());
    if (!parsed.success) {
      throw new Error(`Verify boarding pass HTTP 400 validation failed:\n${parsed.error.message}`);
    }

    return res;
  }
}
