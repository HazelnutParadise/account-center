// server/api/account/me.patch.ts
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

        const body = await readBody<{ name?: string; username?: string; avatar?: string; customData?: Record<string, any> }>(event);

        const updated = await $fetch(`${endpoint}api/my-account`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'content-type': 'application/json',
            },
            body, // 丟你要改的欄位即可
        });

        return updated;
    } catch (error) {
        console.error('Error in /api/account/me (PATCH):', error);
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
});
