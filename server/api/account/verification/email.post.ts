// server/api/account/verification/email.post.ts
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

        const { email } = await readBody<{ email: string }>(event);

        // 請求驗證碼到新Email
        const res = await $fetch(`${endpoint}api/verifications/verification-code`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'content-type': 'application/json'
            },
            body: {
                email,
                type: 'email' // 或其他適當的類型
            },
        });

        return res;
    } catch (error) {
        console.error('Error in /api/account/verification/email:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
});
