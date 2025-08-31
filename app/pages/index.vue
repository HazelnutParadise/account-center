<script setup lang="ts">
import { useLogtoUser, useLogtoClient, callOnce } from '#imports'; // Add this line if auto-import is disabled\
import { ref } from 'vue';
import { navigateTo } from 'nuxt/app';

const user = useLogtoUser();
const client = useLogtoClient();
const userInfo = ref(null);
const accessToken = useState<string | undefined>('access-token');
const accountCenterInfo = ref<any>(null);

async function signOut() {
    await navigateTo('/auth/sign-out');
}

await callOnce(async () => {
    console.log('callOnce 開始執行');
    console.log('user:', user);

    if (!user || !user.sub) {
        console.log('用戶未登入，重定向到登入頁面');
        await navigateTo('/auth/sign-in');
        return;
    }

    console.log('用戶已登入，開始取得 accessToken');
    accessToken.value = await client.getAccessToken();
    console.log('accessToken:', accessToken.value);

    if (!accessToken.value) {
        console.log('accessToken 為空，無法進行 API 請求');
        return;
    }

    console.log('開始發送 API 請求');
    const res = await fetch("https://auth.hazelnut-paradise.com/api/account-center", {
        credentials: 'include',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    })

    console.log('API 請求完成，狀態:', res.status);
    if (res.ok) {
        accountCenterInfo.value = await res.json();
        console.log('成功取得帳戶資訊:', accountCenterInfo.value);
    } else {
        accountCenterInfo.value = `Error: ${res.status} ${res.statusText}`;
        console.log('API 請求失敗:', accountCenterInfo.value);
        const resobj = await res.json();
        console.log('錯誤詳情:', resobj);
    }
})
</script>
<template>
    <div>
        <!-- Display user information when signed in -->
        <ul v-if="Boolean(user)">
            <li v-for="(value, key) in user" :key="key"><b>{{ key }}:</b> {{ value }}</li>
        </ul>
        <p>{{ user }}</p>

        <p>accessToken: {{ accessToken }}</p>

        <p>{{ userInfo }}</p>

        <p>account {{ accountCenterInfo }}</p>

        <button v-if="user" @click="signOut()">登出</button>
    </div>
</template>