// server/api/account/password.post.ts
import { logtoEventHandler } from '#logto';

export default defineEventHandler(async (event) => {
    await logtoEventHandler(event, useRuntimeConfig(event));
    const token = await event.context.logtoClient.getAccessToken();
    const endpoint = process.env.LOGTO_BASE_URL!;

    const { newPassword, verificationRecordId } =
        await readBody<{ newPassword: string; verificationRecordId: string }>(event);

    await $fetch(`${endpoint}/api/my-account/password`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'application/json',
            'logto-verification-id': verificationRecordId,
        },
        body: { password: newPassword },
    });

    return { ok: true };
});
