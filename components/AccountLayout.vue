<template>
    <div class="account-center">
        <div class="container">
            <header class="header">
                <h1>帳號中心</h1>
                <div class="user-info">
                    <span v-if="user">歡迎，{{ user.name || user.username || '用戶' }}</span>
                    <button v-if="user" @click="signOut()" class="btn btn-secondary">登出</button>
                    <span v-else-if="!loading">請先登入</span>
                </div>
            </header>

            <ClientOnly>
                <div v-if="loading" class="loading">
                    <p>載入中...</p>
                </div>

                <div v-else class="dashboard">
                    <nav class="sidebar">
                        <ul>
                            <li>
                                <NuxtLink to="/" :class="{ active: $route.path === '/' }">總覽</NuxtLink>
                            </li>
                            <li>
                                <NuxtLink to="/account/profile" :class="{ active: $route.path === '/account/profile' }">
                                    個人資料</NuxtLink>
                            </li>
                            <li>
                                <NuxtLink to="/account/security"
                                    :class="{ active: $route.path === '/account/security' }">安全性
                                </NuxtLink>
                            </li>
                            <li>
                                <NuxtLink to="/account/mfa" :class="{ active: $route.path === '/account/mfa' }">多因素驗證
                                </NuxtLink>
                            </li>
                        </ul>
                    </nav>

                    <main class="main-content">
                        <slot />
                    </main>
                </div>
            </ClientOnly>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAccount } from '../app/composables/useAccount';

const { user, loading, signOut } = useAccount();
</script>

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

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #5a6268;
}

.loading {
    text-align: center;
    padding: 50px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    padding: 20px 0;
}

.sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar li {
    margin: 0;
}

.sidebar a {
    display: block;
    padding: 12px 20px;
    color: #666;
    text-decoration: none;
    transition: background-color 0.2s, color 0.2s;
}

.sidebar a:hover {
    background-color: #f8f9fa;
    color: #333;
}

.sidebar a.active {
    background-color: #e3f2fd;
    color: #1976d2;
    font-weight: 500;
}

.main-content {
    flex: 1;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
}
</style>
