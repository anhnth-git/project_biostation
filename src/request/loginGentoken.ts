import { APIRequestContext } from "@playwright/test";

export const getToken = async (request: APIRequestContext): Promise<string> => {
    const loginResponse = await request.post(`access-token/login`, {
        data: {
            "userName": "counter",
            "password": "Counter@2025++1"
        }
    });
    const loginBody = await loginResponse.json();
    return loginBody.data.tokenResponse.accessToken;
};


