import { APIRequestContext, APIResponse } from '@playwright/test';

import {
  PassengerEnvelopeSchema,
  PassengerSuccessResponseSchema,
  PassengerValidationErrorSchema,
  type Passenger,
  type PassengerEnvelope,
  type PassengerValidationError,
} from '../schemas/passenger.schema.js';

export type PassengerRequestBody = Record<string, unknown>;

const assertJsonResponse = (contentType: string | undefined, action: string) => {
  if (!contentType?.includes('json')) {
    throw new Error(`${action} returned unexpected content-type: ${contentType ?? 'missing'}`);
  }
};

const parsePassengerEnvelope = async (response: APIResponse): Promise<PassengerEnvelope> => {
  assertJsonResponse(response.headers()['content-type'], 'Create passenger');

  const parsed = PassengerEnvelopeSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`Create passenger response validation failed:\n${parsed.error.message}`);
  }

  return parsed.data;
};

export const postCreatePassenger = (request: APIRequestContext, body: PassengerRequestBody) => {
  return request.post('passenger/create', {
    data: body,
  });
};

export async function createPassengerEnvelope(
  request: APIRequestContext,
  body: PassengerRequestBody,
): Promise<PassengerEnvelope> {
  const res = await postCreatePassenger(request, body);

  if (!res.ok()) {
    throw new Error(`Create passenger failed: ${res.status()} ${await res.text()}`);
  }

  return parsePassengerEnvelope(res);
}

export async function createPassengerSuccess(
  request: APIRequestContext,
  body: PassengerRequestBody,
): Promise<Passenger> {
  const response = await createPassengerEnvelope(request, body);

  if (String(response.statusCode) !== '200') {
    throw new Error(`Create passenger rejected by server: ${response.message ?? 'Unknown error'}`);
  }

  const parsed = PassengerSuccessResponseSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error(`Create passenger success validation failed:\n${parsed.error.message}`);
  }

  return parsed.data.data;
}

export async function createPassengerValidationError(
  request: APIRequestContext,
  body: PassengerRequestBody,
): Promise<PassengerValidationError> {
  const res = await postCreatePassenger(request, body);

  if (res.status() !== 400) {
    throw new Error(`Expected create passenger validation error: ${res.status()} ${await res.text()}`);
  }

  assertJsonResponse(res.headers()['content-type'], 'Create passenger validation');

  const parsed = PassengerValidationErrorSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(`Create passenger validation response failed:\n${parsed.error.message}`);
  }

  return parsed.data;
}

export class PassengerApi {
  requestContext: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.requestContext = request;
  }

  async create(body: PassengerRequestBody) {
    return postCreatePassenger(this.requestContext, body);
  }

  async createSuccess(body: PassengerRequestBody) {
    return createPassengerSuccess(this.requestContext, body);
  }

  async createInvalid(body: PassengerRequestBody) {
    return createPassengerValidationError(this.requestContext, body);
  }
}
