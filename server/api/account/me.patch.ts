// server/api/account/me.patch.ts
import { logtoEventHandler } from '#logto';

export default defineEventHandler(async (event) => {
    await logtoEventHandler(event, useRuntimeConfig(event));
    const token = await event.context.logtoClient.getAccessToken();
    const endpoint = process.env.LOGTO_BASE_URL!;

    const body = await readBody<{ name?: string; username?: string; avatar?: string; customData?: Record<string, any> }>(event);

    const updated = await $fetch(`${endpoint}/api/my-account`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'application/json',
        },
        body, // 丟你要改的欄位即可
    });

    return updated;
});
