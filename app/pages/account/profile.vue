<!-- pages/account/profile.vue -->
<script setup lang="ts">
import { useLogtoUser, useLogtoClient, callOnce } from '#imports';
import { ref } from 'vue';
import { navigateTo } from 'nuxt/app';

const user = useLogtoUser();
const client = useLogtoClient();
const accessToken = useState<string | undefined>('access-token');
const loading = ref(true);
const saving = ref(false);

// 編輯表單數據
const editForm = ref({
    name: '',
    username: '',
    email: '',
    phone_number: ''
});

const isEditing = ref(false);

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

        // 載入用戶數據到編輯表單
        editForm.value = {
            name: user.value.name || '',
            username: user.value.username || '',
            email: user.value.email || '',
            phone_number: user.value.phone_number || ''
        };
    } catch (error) {
        console.error('載入用戶數據失敗:', error);
        await navigateTo('/auth/sign-in');
    } finally {
        loading.value = false;
    }
}

async function saveProfile() {
    if (!accessToken.value) return;

    saving.value = true;
    try {
        const response = await fetch('/api/account/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken.value}`
            },
            body: JSON.stringify({
                name: editForm.value.name,
                username: editForm.value.username
            })
        });

        if (response.ok) {
            alert('個人資料已更新！');
            isEditing.value = false;
            // 重新載入頁面以獲取最新數據
            window.location.reload();
        } else {
            const error = await response.json();
            alert('更新失敗: ' + (error.message || '未知錯誤'));
        }
    } catch (error) {
        console.error('更新個人資料失敗:', error);
        alert('更新失敗，請稍後再試');
    } finally {
        saving.value = false;
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
                            <NuxtLink to="/account/security">安全性</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/account/profile" class="active">個人資料</NuxtLink>
                        </li>
                    </ul>
                </nav>

                <main class="main-content">
                    <section class="profile-edit">
                        <div class="section-header">
                            <h2>個人資料</h2>
                            <button v-if="!isEditing" @click="isEditing = true" class="btn btn-primary">
                                編輯
                            </button>
                        </div>

                        <div v-if="!isEditing" class="profile-display">
                            <div class="profile-card">
                                <div class="avatar">
                                    <img v-if="user.picture" :src="user.picture" :alt="user.name || '用戶頭像'" />
                                    <div v-else class="avatar-placeholder">{{ (user.name || user.username ||
                                        'U').charAt(0).toUpperCase() }}</div>
                                </div>
                                <div class="profile-details">
                                    <h3>{{ user.name || user.username || '未設定名稱' }}</h3>
                                    <p v-if="user.email"><strong>電子郵件：</strong>{{ user.email }}</p>
                                    <p v-if="user.phone_number"><strong>手機號碼：</strong>{{ user.phone_number }}</p>
                                    <p v-if="user.username"><strong>用戶名稱：</strong>{{ user.username }}</p>
                                </div>
                            </div>
                        </div>

                        <form v-else @submit.prevent="saveProfile" class="profile-form">
                            <div class="form-group">
                                <label for="name">姓名</label>
                                <input id="name" v-model="editForm.name" type="text" class="form-control" />
                            </div>

                            <div class="form-group">
                                <label for="username">用戶名稱</label>
                                <input id="username" v-model="editForm.username" type="text" class="form-control" />
                            </div>

                            <div class="form-group">
                                <label for="email">電子郵件</label>
                                <input id="email" v-model="editForm.email" type="email" class="form-control" disabled />
                                <small class="form-text">電子郵件無法在此編輯</small>
                            </div>

                            <div class="form-group">
                                <label for="phone">手機號碼</label>
                                <input id="phone" v-model="editForm.phone_number" type="tel" class="form-control"
                                    disabled />
                                <small class="form-text">手機號碼無法在此編輯</small>
                            </div>

                            <div class="form-actions">
                                <button type="submit" :disabled="saving" class="btn btn-primary">
                                    {{ saving ? '儲存中...' : '儲存' }}
                                </button>
                                <button type="button" @click="isEditing = false" class="btn btn-secondary">
                                    取消
                                </button>
                            </div>
                        </form>
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

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-header h2 {
    margin: 0;
    color: #333;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 10px;
}

.profile-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
}

.avatar img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #1976d2;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
}

.profile-details h3 {
    margin: 0 0 10px 0;
    color: #333;
}

.profile-details p {
    margin: 5px 0;
    color: #666;
}

.profile-form {
    max-width: 600px;
}

.form-group {
    margin-bottom: 20px;
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

.form-control:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.form-text {
    display: block;
    margin-top: 5px;
    color: #666;
    font-size: 14px;
}

.form-actions {
    display: flex;
    gap: 10px;
    margin-top: 30px;
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

.loading,
.not-logged-in {
    text-align: center;
    padding: 50px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
