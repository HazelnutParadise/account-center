import { createManagementApi } from '@logto/api/management';

const logtoEndpoint = process.env.LOGTO_ENDPOINT; // Replace with your Logto endpoint
const clientId = process.env.LOGTO_M2M_CLIENT_ID;
const clientSecret = process.env.LOGTO_M2M_CLIENT_SECRET;

const { apiClient, clientCredentials } = createManagementApi('default', {
    clientId: clientId,
    clientSecret: clientSecret,
    baseUrl: logtoEndpoint,
    apiIndicator: 'https://default.logto.app/api',
});

const accountApiStatus = await apiClient.GET('/api/account-center');
console.log(accountApiStatus.data);

const enableAccountAPI = await apiClient.PATCH(
    '/api/account-center',
    {
        requestBody: {
            content: {
                "application/json": {
                    enabled: true,
                    fields: {
                        username: "Edit",
                        email: "Edit",
                        phone: "Edit",
                        name: "Edit",
                        avatar: "Edit",
                        profile: "Edit"
                    },
                    webauthnRelatedOrigins: ["https://account.hazelnut-paradise.com"]
                    }
            }
        }
    }
);
console.log(enableAccountAPI);