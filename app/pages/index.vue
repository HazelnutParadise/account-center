<script setup lang="ts">
import { useLogtoUser, useLogtoClient, callOnce } from '#imports';
import { ref } from 'vue';
import { navigateTo } from 'nuxt/app';

const user = useLogtoUser();
const client = useLogtoClient();
const userInfo = ref(null);
const accessToken = useState<string | undefined>('access-token');
const accountCenterInfo = ref<any>(null);
const loading = ref(true);

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
    try {
        accessToken.value = await client.getAccessToken();
        console.log('accessToken:', accessToken.value);

        if (!accessToken.value) {
            console.log('accessToken 為空，嘗試重新取得 Token');
            await client.refreshAccessToken();
            accessToken.value = await client.getAccessToken();

            if (!accessToken.value) {
                console.log('仍無法取得 accessToken，重新導向到登入頁面');
                await navigateTo('/auth/sign-in');
                return;
            }
        }
    } catch (tokenError) {
        console.error('取得 accessToken 時發生錯誤:', tokenError);
        await navigateTo('/auth/sign-in');
        return;
    }

    console.log('開始發送 API 請求');
    try {
        const res = await fetch("https://auth.hazelnut-paradise.com/api/my-account", {
            credentials: 'include',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken.value}`,
                'Content-Type': 'application/json'
            }
        })

        console.log('API 請求完成，狀態:', res.status);
        if (res.ok) {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                accountCenterInfo.value = await res.json();
                console.log('成功取得帳戶資訊:', accountCenterInfo.value);
            } else {
                const textResponse = await res.text();
                console.log('API 回應非 JSON 格式:', textResponse);
                accountCenterInfo.value = `Response: ${textResponse}`;
            }
        } else {
            const contentType = res.headers.get('content-type');
            let errorDetails = `Error: ${res.status} ${res.statusText}`;

            try {
                if (contentType && contentType.includes('application/json')) {
                    const resobj = await res.json();
                    errorDetails += ` - ${JSON.stringify(resobj)}`;
                } else {
                    const textResponse = await res.text();
                    errorDetails += ` - ${textResponse}`;
                }
            } catch (parseError) {
                console.error('無法解析錯誤回應:', parseError);
            }

            accountCenterInfo.value = errorDetails;
            console.log('API 請求失敗:', errorDetails);
        }
    } catch (error) {
        console.error('API 請求發生錯誤:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        accountCenterInfo.value = `Network Error: ${errorMessage}`;

        if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
            console.log('授權錯誤，重新導向至登入頁面');
            await navigateTo('/auth/sign-in');
        }
    } finally {
        loading.value = false;
    }
})
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
                            <NuxtLink to="/" class="active">總覽</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/account/security">安全性</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/account/profile">個人資料</NuxtLink>
                        </li>
                    </ul>
                </nav>

                <main class="main-content">
                    <section class="user-profile">
                        <h2>個人資訊</h2>
                        <div class="profile-card">
                            <div class="avatar">
                                <img v-if="user.picture" :src="user.picture" :alt="user.name || '用戶頭像'" />
                                <div v-else class="avatar-placeholder">{{ (user.name || user.username ||
                                    'U').charAt(0).toUpperCase() }}</div>
                            </div>
                            <div class="profile-details">
                                <h3>{{ user.name || user.username || '未設定名稱' }}</h3>
                                <p v-if="user.email">{{ user.email }}</p>
                                <p v-if="user.phone_number">{{ user.phone_number }}</p>
                                <p v-if="user.updated_at">最後更新：{{ new Date(user.updated_at *
                                    1000).toLocaleDateString('zh-TW') }}</p>
                            </div>
                        </div>
                    </section>

                    <section class="account-status">
                        <h2>帳號狀態</h2>
                        <div class="status-grid">
                            <div class="status-item">
                                <h4>電子郵件驗證</h4>
                                <span :class="user.email_verified ? 'verified' : 'unverified'">
                                    {{ user.email_verified ? '已驗證' : '未驗證' }}
                                </span>
                            </div>
                            <div class="status-item">
                                <h4>手機驗證</h4>
                                <span :class="user.phone_number_verified ? 'verified' : 'unverified'">
                                    {{ user.phone_number_verified ? '已驗證' : '未驗證' }}
                                </span>
                            </div>
                            <div class="status-item">
                                <h4>帳號建立時間</h4>
                                <span>{{ new Date(user.created_at * 1000).toLocaleDateString('zh-TW') }}</span>
                            </div>
                        </div>
                    </section>

                    <section v-if="accountCenterInfo" class="account-center-info">
                        <h2>帳號中心資訊</h2>
                        <pre>{{ JSON.stringify(accountCenterInfo, null, 2) }}</pre>
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

.user-profile,
.account-status,
.account-center-info {
    margin-bottom: 30px;
}

.user-profile h2,
.account-status h2,
.account-center-info h2 {
    margin-top: 0;
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

.status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.status-item {
    padding: 15px;
    background: #f9f9f9;
    border-radius: 8px;
    text-align: center;
}

.status-item h4 {
    margin: 0 0 10px 0;
    color: #333;
}

.verified {
    color: #4caf50;
    font-weight: bold;
}

.unverified {
    color: #f44336;
    font-weight: bold;
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

pre {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
}
</style>