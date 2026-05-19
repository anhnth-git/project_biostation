import { APIRequestContext, expect } from "@playwright/test";

export class createPassenger {
    counterContext: APIRequestContext;
    constructor(request: APIRequestContext) {
        this.counterContext = request;
    };


    // Helper: base login request using counterContext
    async create(body: object) {
        const response = await this.counterContext.post(`passenger/create`, {
            data: body
        });
        return response;
    }

    async createSuccess(body: object) {
        const response = await this.counterContext.post(`passenger/create`, {
            data: body
        });

        expect(response.status()).toEqual(200);
        expect(response.headers()['content-type']).toContain('application/json');
        const responseJson = await response.json();
        expect(responseJson.statusCode).toContain('200');

        const data = responseJson.data;
        expect(typeof data.id).toBe('number');
        expect(typeof data.idNumber).toBe('string');
        expect(typeof data.fullName).toBe('string');
        expect(data.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);   // "1999-11-23T00:00:00"
        expect(data.expiryDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);  // "2038-11-06T00:00:00"
        expect(typeof data.enrollChannel).toBe('string');
        expect(typeof data.checkinType).toBe('string');

        return responseJson.data;
    }

    async createInvalidated(body: object) {
        const response = await this.counterContext.post(`passenger/create`, {
            data: body
        });

        expect(response.status()).toEqual(400);
        const responseJson = await response.json();
        expect(responseJson.statusCode).toEqual(400);
        expect(responseJson.message).toContain("One or more errors occurred!");

        return responseJson;
    }


}
