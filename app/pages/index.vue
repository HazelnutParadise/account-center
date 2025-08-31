<script setup lang="ts">
import { useLogtoUser, useLogtoClient, callOnce } from '#imports'; // Add this line if auto-import is disabled\
import { ref } from 'vue';
import { navigateTo } from 'nuxt/app';

const user = useLogtoUser();
const client = useLogtoClient();
const userInfo = ref(null);
const accessToken = useState<string | undefined>('access-token');

async function signOut() {
    await navigateTo('/auth/sign-out');
}

await callOnce(async () => {
    if (!user || !user.sub) {
        await navigateTo('/auth/sign-in');
        return;
    }

    accessToken.value = await client.getAccessToken();
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

        <button v-if="user" @click="signOut()">登出</button>
    </div>
</template>