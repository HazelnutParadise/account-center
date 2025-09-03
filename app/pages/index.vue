<script setup lang="ts">
import { useAccount } from '../composables/useAccount';
import { ref } from 'vue';

const accountCenterInfo = ref<any>(null);

const customLoadSpecificData = async () => {
    accountCenterInfo.value = await $fetch('/api/account/me');
    console.log('成功取得帳戶資訊:', accountCenterInfo.value);
};

const { user, loading, signOut } = useAccount(customLoadSpecificData);
</script>
<template>
    <AccountLayout>
        <section class="user-profile">
            <h2>個人資訊</h2>
            <div class="profile-card">
                <div class="avatar">
                    <img v-if="accountCenterInfo?.avatar" :src="accountCenterInfo.avatar" alt="頭像" />
                    <div v-else class="avatar-placeholder">
                        {{ (accountCenterInfo?.name || accountCenterInfo?.username ||
                            'U').charAt(0).toUpperCase() }}
                    </div>
                </div>
                <div class="profile-details">
                    <h3>{{ accountCenterInfo?.name || accountCenterInfo?.username || '未設定名稱' }}</h3>
                    <p v-if="accountCenterInfo?.username">用戶名：{{ accountCenterInfo.username }}</p>
                    <p v-if="user?.email">電子郵件：{{ user.email }}</p>
                    <p v-if="user?.phone_number">手機號碼：{{ user.phone_number }}</p>
                    <p>最後登入：{{ accountCenterInfo?.lastSignInAt ? new
                        Date(accountCenterInfo.lastSignInAt).toLocaleString('zh-TW') : '未知' }}</p>
                    <p>帳號建立：{{ accountCenterInfo?.createdAt ? new
                        Date(accountCenterInfo.createdAt).toLocaleString('zh-TW') : '未知' }}</p>
                </div>
            </div>
        </section>

        <section class="account-status">
            <h2>帳號狀態</h2>
            <div class="status-grid">
                <div class="status-item">
                    <h4>電子郵件驗證</h4>
                    <span :class="user?.email_verified ? 'verified' : 'unverified'">
                        {{ user?.email_verified ? '已驗證' : '未驗證' }}
                    </span>
                </div>
                <div class="status-item">
                    <h4>手機驗證</h4>
                    <span :class="user?.phone_number_verified ? 'verified' : 'unverified'">
                        {{ user?.phone_number_verified ? '已驗證' : '未驗證' }}
                    </span>
                </div>
                <div class="status-item">
                    <h4>密碼保護</h4>
                    <span :class="accountCenterInfo?.hasPassword ? 'verified' : 'unverified'">
                        {{ accountCenterInfo?.hasPassword ? '已設定' : '未設定' }}
                    </span>
                </div>
                <div class="status-item">
                    <h4>帳號狀態</h4>
                    <span :class="accountCenterInfo?.isSuspended ? 'unverified' : 'verified'">
                        {{ accountCenterInfo?.isSuspended ? '已停用' : '正常' }}
                    </span>
                </div>
            </div>
        </section>

        <section class="quick-actions">
            <h2>快速操作</h2>
            <div class="action-grid">
                <NuxtLink to="/account/profile" class="action-card">
                    <h4>編輯個人資料</h4>
                    <p>修改您的姓名、頭像等個人資訊</p>
                </NuxtLink>
                <NuxtLink to="/account/security" class="action-card">
                    <h4>安全設定</h4>
                    <p>修改密碼、設定多重驗證</p>
                </NuxtLink>
                <NuxtLink to="/account/mfa" class="action-card">
                    <h4>多重驗證</h4>
                    <p>設定額外的安全保護</p>
                </NuxtLink>
            </div>
        </section>
    </AccountLayout>
</template>

<style scoped>
.user-profile,
.account-status,
.quick-actions {
    margin-bottom: 30px;
}

.user-profile h2,
.account-status h2,
.quick-actions h2 {
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

.action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.action-card {
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.action-card:hover {
    background: #e3f2fd;
    border-color: #1976d2;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-card h4 {
    margin: 0 0 10px 0;
    color: #1976d2;
}

.action-card p {
    margin: 0;
    color: #666;
    font-size: 14px;
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

pre {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
}
</style>