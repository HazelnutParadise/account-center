<script setup>
import { useLogtoUser } from '#imports'; // Add this line if auto-import is disabled
import { onMounted } from 'vue';
import { navigateTo } from 'nuxt/app';

const user = useLogtoUser();

onMounted(async () => {
    if (!user || !user.sub) {
        await navigateTo('/auth/sign-in');
    }
});

async function signOut() {
    await navigateTo('/auth/sign-out');
}
</script>
<template>
    <!-- Display user information when signed in -->
    <ul v-if="Boolean(user)">
        <li v-for="(value, key) in user"><b>{{ key }}:</b> {{ value }}</li>
    </ul>
    <!-- Simplified button for sign-in and sign-out -->

    <button v-if="user" @click="signOut()">登出</button>
</template>