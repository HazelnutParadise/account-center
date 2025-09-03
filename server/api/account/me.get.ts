// server/api/account/me.get.ts
import { logtoEventHandler } from '#logto';

export default defineEventHandler(async (event) => {
    try {
        const config = useRuntimeConfig(event);
        await logtoEventHandler(event, config);

        const token = await event.context.logtoClient.getAccessToken(); // 移除 resource

        // 使用 config 中的 endpoint 而不是環境變數
        const endpoint = config.logto.endpoint || process.env.NUXT_LOGTO_ENDPOINT;

        if (!endpoint) {
            throw new Error('LOGTO_ENDPOINT is not configured');
        }

        console.log('API endpoint:', endpoint);
        console.log('Token:', token ? 'Token exists' : 'No token');

        const response = await $fetch(`${endpoint}api/my-account`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        });

        console.log('Response type:', typeof response);
        console.log('Response preview:', JSON.stringify(response).substring(0, 200));

        return response;
    } catch (error) {
        console.error('Error in /api/account/me:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
});
