import { APIRequestContext, expect } from "@playwright/test";

export class verifyBoardingpass {
    requestContext: APIRequestContext;
    passengerID: number;

    constructor(request: APIRequestContext, passengerID: number) {
        this.requestContext = request;
        this.passengerID = passengerID;
    }

    createPayload(body: object) {
        return { ...body, passengerId: this.passengerID };
    }

    postVerify(body: object) {
        return this.requestContext.post(`acv/verify-boarding-pass`, {
            data: body
        });
    }
    

    async verify(body: object) {
        const response = await this.postVerify(this.createPayload(body));
        expect(response.status()).toEqual(200);
        return response.json();
    }

    async verifySuccess(body: object) {
        const response = await this.postVerify(this.createPayload(body));
        expect(response.status()).toEqual(200);
        expect(response.headers()['content-type']).toContain('application/json');

        const responseJson = await response.json();
        expect(responseJson.statusCode).toContain("200");
        expect(responseJson.data).toBeTruthy();
        expect(typeof responseJson.statusCode).toBe('string');

        return responseJson;
    }

    async verrifyBPStatuscode(body: object, statusCode: string, message: string) {
        const response = await this.postVerify(this.createPayload(body));
        expect(response.status()).toEqual(200);

        const responseJson = await response.json();
        expect(responseJson.statusCode).toContain(statusCode);
        expect(responseJson.message).toContain(message);
        expect(responseJson.data).not.toBeTruthy();

        return responseJson;
    }

    async verifyValidate(body: object) {
        return this.postVerify(this.createPayload(body));
    }

    async verifyRaw(body: object) {
        return this.postVerify(body);
    }

    async verifyValidateHttp400(body: object) {
        const response = await this.postVerify(this.createPayload(body));
        expect(response.status()).toEqual(400);

        const responseJson = await response.json();
        expect(responseJson.statusCode).toEqual(400);
        expect(responseJson.message).toContain("One or more errors occurred!");

        return response;
    }
}
