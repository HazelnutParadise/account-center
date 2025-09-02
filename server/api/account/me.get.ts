// server/api/account/me.get.ts
import { logtoEventHandler } from '#logto';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    await logtoEventHandler(event, config);

    const token = await event.context.logtoClient.getAccessToken(); // 不帶 resource
    const endpoint = process.env.LOGTO_BASE_URL!; // 你的自架網域

    const me = await $fetch(`${endpoint}/api/my-account`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return me;
});
