// server/api/account/phone.post.ts
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

        const { phone_number, verificationCode, verificationRecordId } =
            await readBody<{ phone_number: string; verificationCode: string; verificationRecordId: string }>(event);

        // 使用驗證碼變更手機
        const updated = await $fetch(`${endpoint}api/my-account`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'content-type': 'application/json',
                'logto-verification-id': verificationRecordId,
            },
            body: { phone_number },
        });

        return updated;
    } catch (error) {
        console.error('Error in /api/account/phone:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
});
