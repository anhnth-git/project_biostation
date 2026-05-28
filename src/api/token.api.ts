import { APIRequestContext } from '@playwright/test';

import type { TokenEnvelope, TokenResponse } from '../schemas/token.schema.js';

export type TokenRequestBody = Record<string, unknown>;

const assertJsonResponse = (contentType: string | undefined, action: string) => {
  if (!contentType?.includes('json')) {
    throw new Error(`${action} returned unexpected content-type: ${contentType ?? 'missing'}`);
  }
};

export const createTokenPayload = (passengerId: number, body: TokenRequestBody = {}) => {
  return { ...body, passengerId };
};

export const postCreateToken = (request: APIRequestContext, body: TokenRequestBody) => {
  return request.post('token/create', {
    data: body,
  });
};

export async function createTokenEnvelope(
  request: APIRequestContext,
  passengerId: number,
  body: TokenRequestBody = {},
): Promise<TokenEnvelope> {
  const res = await postCreateToken(request, createTokenPayload(passengerId, body));

  if (!res.ok()) {
    throw new Error(`Create token failed: ${res.status()} ${await res.text()}`);
  }

  assertJsonResponse(res.headers()['content-type'], 'Create token');

  return (await res.json()) as TokenEnvelope;
}

export async function createTokenSuccess(
  request: APIRequestContext,
  passengerId: number,
  body: TokenRequestBody = {},
): Promise<TokenResponse> {
  const response = await createTokenEnvelope(request, passengerId, body);

  if (!String(response.statusCode).includes('200')) {
    throw new Error(
      `Create token rejected by server [${String(response.statusCode)}]: ${response.message ?? 'Unknown error'}`,
    );
  }

  if (!response.data) {
    throw new Error('Create token returned empty data');
  }

  return response as TokenResponse;
}

export class TokenApi {
  requestContext: APIRequestContext;
  passengerId: number;

  constructor(request: APIRequestContext, passengerId: number) {
    this.requestContext = request;
    this.passengerId = passengerId;
  }

  createPayload(body: TokenRequestBody = {}) {
    return createTokenPayload(this.passengerId, body);
  }

  postCreate(body: TokenRequestBody) {
    return postCreateToken(this.requestContext, body);
  }

  async create(body: TokenRequestBody = {}) {
    return this.postCreate(this.createPayload(body));
  }

  async createSuccess(body: TokenRequestBody = {}) {
    return createTokenSuccess(this.requestContext, this.passengerId, body);
  }
}
