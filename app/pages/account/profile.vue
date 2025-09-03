<template>
    <AccountLayout>
        <section class="profile-edit">
            <h2>編輯個人資料</h2>
            <form @submit.prevent="updateProfile" class="profile-form">
                <div class="form-group">
                    <label for="name">姓名</label>
                    <input id="name" v-model="formData.name" type="text" placeholder="輸入您的姓名" />
                </div>
                <div class="form-group">
                    <label for="username">用戶名</label>
                    <input id="username" v-model="formData.username" type="text" placeholder="輸入用戶名" />
                </div>
                <div class="form-group">
                    <label for="avatar">頭像 URL</label>
                    <input id="avatar" v-model="formData.avatar" type="url" placeholder="輸入頭像圖片 URL" />
                </div>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                    {{ loading ? '更新中...' : '更新個人資料' }}
                </button>
            </form>
            <div v-if="message" class="message" :class="{ error: message.type === 'error' }">
                {{ message.text }}
            </div>
        </section>
    </AccountLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAccount } from '../../composables/useAccount';

const { user, loading: accountLoading } = useAccount();
const loading = ref(false);
const message = ref<{ type: string; text: string } | null>(null);

const formData = ref({
    name: '',
    username: '',
    avatar: ''
});

const updateProfile = async () => {
    loading.value = true;
    message.value = null;

    try {
        await $fetch('/api/account/me', {
            method: 'PATCH',
            body: formData.value
        });
        message.value = { type: 'success', text: '個人資料更新成功！' };
    } catch (error: any) {
        message.value = { type: 'error', text: error.data?.message || '更新失敗，請重試' };
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    if (user.value) {
        formData.value = {
            name: user.value.name || '',
            username: user.value.username || '',
            avatar: user.value.avatar || ''
        };
    }
});
</script>

<style scoped>
.profile-edit {
    max-width: 600px;
}

.profile-edit h2 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 10px;
}

.profile-form {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
}

.form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

.form-group input:focus {
    outline: none;
    border-color: #1976d2;
}

.message {
    margin-top: 20px;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
}

.message.error {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
}
</style>
