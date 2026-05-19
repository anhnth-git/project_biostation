import { APIRequestContext, expect } from "@playwright/test";

export class createToken {
    requestContext: APIRequestContext;
    passengerID: number;

    constructor(request: APIRequestContext, passengerID: number) {
        this.requestContext = request;
        this.passengerID = passengerID;
    }

    createPayload(body: object = {}) {
        return { ...body, passengerId: this.passengerID };
    }

    postCreate(body: object) {
        return this.requestContext.post(`token/create`, {
            data: body
        });
    }

    async create(body: object = {}) {
        return this.postCreate(this.createPayload(body));
    }

    async createSuccess(body: object = {}) {
        const response = await this.create(body);
        expect(response.status()).toEqual(200);
        expect(response.headers()['content-type']).toContain('application/json');

        const responseJson = await response.json();
        expect(responseJson.statusCode).toContain("200");
        expect(responseJson.data).toBeTruthy();

        return responseJson;
    }
}
