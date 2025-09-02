<!-- pages/account/security.vue -->
<script setup lang="ts">
import { useLogtoUser, useLogtoClient, callOnce } from '#imports';
import { ref } from 'vue';
import { navigateTo } from 'nuxt/app';

const user = useLogtoUser();
const client = useLogtoClient();
const accessToken = useState<string | undefined>('access-token');
const loading = ref(true);

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const changing = ref(false);

async function signOut() {
    await navigateTo('/auth/sign-out');
}

async function loadUserData() {
    if (!user.value || !user.value.sub) {
        await navigateTo('/auth/sign-in');
        return;
    }

    try {
        const token = await client.getAccessToken();
        if (!token) {
            await navigateTo('/auth/sign-in');
            return;
        }
        accessToken.value = token;
    } catch (error) {
        console.error('載入用戶數據失敗:', error);
        await navigateTo('/auth/sign-in');
    } finally {
        loading.value = false;
    }
}

async function changePassword() {
    if (newPassword.value !== confirmPassword.value) {
        alert('新密碼與確認密碼不符');
        return;
    }

    if (!currentPassword.value || !newPassword.value) {
        alert('請填寫所有欄位');
        return;
    }

    changing.value = true;
    try {
        const response = await $fetch<{ verificationRecordId: string }>('/api/account/verification/password', {
            method: 'POST',
            body: { currentPassword: currentPassword.value },
        });
        const { verificationRecordId } = response;

        await $fetch('/api/account/password', {
            method: 'POST',
            body: { newPassword: newPassword.value, verificationRecordId },
        });

        alert('密碼已成功更新！');
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
    } catch (error) {
        console.error('更改密碼失敗:', error);
        alert('更改密碼失敗，請檢查目前密碼是否正確');
    } finally {
        changing.value = false;
    }
}

await callOnce(loadUserData);
</script>

<template>
    <div class="account-center">
        <div class="container">
            <header class="header">
                <h1>帳號中心</h1>
                <div class="user-info">
                    <span v-if="user">歡迎，{{ user.name || user.username || '用戶' }}</span>
                    <button v-if="user" @click="signOut()" class="btn btn-secondary">登出</button>
                </div>
            </header>

            <div v-if="loading" class="loading">
                <p>載入中...</p>
            </div>

            <div v-else-if="user" class="dashboard">
                <nav class="sidebar">
                    <ul>
                        <li>
                            <NuxtLink to="/">總覽</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/account/security" class="active">安全性</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/account/profile">個人資料</NuxtLink>
                        </li>
                    </ul>
                </nav>

                <main class="main-content">
                    <section class="security-settings">
                        <h2>安全性設定</h2>

                        <div class="security-card">
                            <h3>更改密碼</h3>
                            <p class="description">定期更改密碼有助於保護您的帳號安全。</p>

                            <form @submit.prevent="changePassword" class="password-form">
                                <div class="form-group">
                                    <label for="currentPassword">目前密碼</label>
                                    <input id="currentPassword" v-model="currentPassword" type="password"
                                        class="form-control" required />
                                </div>

                                <div class="form-group">
                                    <label for="newPassword">新密碼</label>
                                    <input id="newPassword" v-model="newPassword" type="password" class="form-control"
                                        required minlength="8" />
                                    <small class="form-text">密碼至少需要8個字符</small>
                                </div>

                                <div class="form-group">
                                    <label for="confirmPassword">確認新密碼</label>
                                    <input id="confirmPassword" v-model="confirmPassword" type="password"
                                        class="form-control" required minlength="8" />
                                </div>

                                <button type="submit" :disabled="changing" class="btn btn-primary">
                                    {{ changing ? '更新中...' : '更新密碼' }}
                                </button>
                            </form>
                        </div>

                        <div class="security-card">
                            <h3>帳號安全狀態</h3>
                            <div class="security-status">
                                <div class="status-item">
                                    <div class="status-icon verified">
                                        <span>✓</span>
                                    </div>
                                    <div class="status-content">
                                        <h4>電子郵件驗證</h4>
                                        <p>{{ user.email_verified ? '已驗證' : '未驗證' }}</p>
                                    </div>
                                </div>

                                <div class="status-item">
                                    <div class="status-icon verified">
                                        <span>✓</span>
                                    </div>
                                    <div class="status-content">
                                        <h4>手機驗證</h4>
                                        <p>{{ user.phone_number_verified ? '已驗證' : '未驗證' }}</p>
                                    </div>
                                </div>

                                <div class="status-item">
                                    <div class="status-icon info">
                                        <span>ℹ</span>
                                    </div>
                                    <div class="status-content">
                                        <h4>最後登入</h4>
                                        <p>{{ user.updated_at ? new Date(user.updated_at * 1000).toLocaleString('zh-TW')
                                            : '未知' }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            <div v-else class="not-logged-in">
                <p>您尚未登入，請先登入以存取帳號中心。</p>
                <NuxtLink to="/auth/sign-in" class="btn btn-primary">登入</NuxtLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.account-center {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.header h1 {
    margin: 0;
    color: #333;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.dashboard {
    display: flex;
    gap: 20px;
}

.sidebar {
    width: 250px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar li {
    margin-bottom: 10px;
}

.sidebar a {
    display: block;
    padding: 10px 15px;
    text-decoration: none;
    color: #666;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.sidebar a:hover,
.sidebar a.active {
    background-color: #e3f2fd;
    color: #1976d2;
}

.main-content {
    flex: 1;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.security-settings h2 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 10px;
}

.security-card {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
}

.security-card h3 {
    margin-top: 0;
    color: #333;
}

.description {
    color: #666;
    margin-bottom: 20px;
}

.password-form {
    max-width: 400px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
}

.form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

.form-text {
    display: block;
    margin-top: 5px;
    color: #666;
    font-size: 14px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: background-color 0.3s;
}

.btn-primary {
    background-color: #1976d2;
    color: white;
}

.btn-primary:hover {
    background-color: #1565c0;
}

.btn-primary:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.btn-secondary {
    background-color: #f44336;
    color: white;
}

.btn-secondary:hover {
    background-color: #d32f2f;
}

.security-status {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
}

.status-icon.verified {
    background-color: #4caf50;
    color: white;
}

.status-icon.info {
    background-color: #2196f3;
    color: white;
}

.status-content h4 {
    margin: 0 0 5px 0;
    color: #333;
}

.status-content p {
    margin: 0;
    color: #666;
}

.loading,
.not-logged-in {
    text-align: center;
    padding: 50px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
