// server/api/account/verification/phone.post.ts
import { logtoEventHandler } from '#logto';

export default defineEventHandler(async (event) => {
    try {
        const config = useRuntimeConfig(event);
        await logtoEventHandler(event, config);
        const token = await event.context.logtoClient.getAccessToken();

        // 使用正確的環境變數
        const endpoint = config.logto.endpoint || process.env.NUXT_LOGTO_ENDPOINT;

        if (!endpoint) {
            throw new Error('LOGTO_ENDPOINT is not configured');
        }

        const { phone } = await readBody<{ phone: string }>(event);

        // 請求驗證碼到新手機
        const res = await $fetch(`${endpoint}api/verifications/verification-code`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'content-type': 'application/json'
            },
            body: {
                phone,
                type: 'phone'
            },
        });

        return res;
    } catch (error) {
        console.error('Error in /api/account/verification/phone:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
});
