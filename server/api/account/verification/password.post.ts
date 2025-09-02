// server/api/account/verification/password.post.ts
import { logtoEventHandler } from '#logto';

export default defineEventHandler(async (event) => {
    await logtoEventHandler(event, useRuntimeConfig(event));
    const token = await event.context.logtoClient.getAccessToken();
    const endpoint = process.env.LOGTO_BASE_URL!;

    const { currentPassword } = await readBody<{ currentPassword: string }>(event);

    const res = await $fetch<{ verificationRecordId: string }>(`${endpoint}/api/verifications/password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: { password: currentPassword },
    });

    return res; // { verificationRecordId }
});
