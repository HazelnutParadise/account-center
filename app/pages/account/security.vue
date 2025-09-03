<template>
    <AccountLayout>
        <section class="security-settings">
            <h2>安全設定</h2>

            <div class="security-section">
                <h3>修改密碼</h3>
                <form @submit.prevent="changePassword" class="password-form">
                    <div class="form-group">
                        <label for="currentPassword">目前密碼</label>
                        <input id="currentPassword" v-model="passwordData.currentPassword" type="password" required />
                    </div>
                    <div class="form-group">
                        <label for="newPassword">新密碼</label>
                        <input id="newPassword" v-model="passwordData.newPassword" type="password" required />
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">確認新密碼</label>
                        <input id="confirmPassword" v-model="passwordData.confirmPassword" type="password" required />
                    </div>
                    <button type="submit" class="btn btn-primary" :disabled="passwordLoading">
                        {{ passwordLoading ? '更新中...' : '修改密碼' }}
                    </button>
                </form>
            </div>

            <div class="security-section">
                <h3>電子郵件設定</h3>
                <form @submit.prevent="updateEmail" class="email-form">
                    <div class="form-group">
                        <label for="email">新電子郵件</label>
                        <input id="email" v-model="emailData.email" type="email" required />
                    </div>
                    <button type="submit" class="btn btn-primary" :disabled="emailLoading">
                        {{ emailLoading ? '更新中...' : '更新電子郵件' }}
                    </button>
                </form>
            </div>

            <div class="security-section">
                <h3>手機號碼設定</h3>
                <form @submit.prevent="updatePhone" class="phone-form">
                    <div class="form-group">
                        <label for="phone">新手機號碼</label>
                        <input id="phone" v-model="phoneData.phone" type="tel" required />
                    </div>
                    <button type="submit" class="btn btn-primary" :disabled="phoneLoading">
                        {{ phoneLoading ? '更新中...' : '更新手機號碼' }}
                    </button>
                </form>
            </div>

            <div v-if="message" class="message" :class="{ error: message.type === 'error' }">
                {{ message.text }}
            </div>
        </section>
    </AccountLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAccount } from '../../composables/useAccount';

const { user } = useAccount();
const passwordLoading = ref(false);
const emailLoading = ref(false);
const phoneLoading = ref(false);
const message = ref<{ type: string; text: string } | null>(null);

const passwordData = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const emailData = ref({
    email: ''
});

const phoneData = ref({
    phone: ''
});

const changePassword = async () => {
    if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        message.value = { type: 'error', text: '新密碼與確認密碼不匹配' };
        return;
    }

    passwordLoading.value = true;
    message.value = null;

    try {
        await $fetch('/api/account/password', {
            method: 'POST',
            body: {
                currentPassword: passwordData.value.currentPassword,
                newPassword: passwordData.value.newPassword
            }
        });
        message.value = { type: 'success', text: '密碼修改成功！' };
        passwordData.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    } catch (error: any) {
        message.value = { type: 'error', text: error.data?.message || '密碼修改失敗，請重試' };
    } finally {
        passwordLoading.value = false;
    }
};

const updateEmail = async () => {
    emailLoading.value = true;
    message.value = null;

    try {
        await $fetch('/api/account/email', {
            method: 'POST',
            body: { email: emailData.value.email }
        });
        message.value = { type: 'success', text: '電子郵件更新成功！請檢查您的郵箱進行驗證。' };
        emailData.value = { email: '' };
    } catch (error: any) {
        message.value = { type: 'error', text: error.data?.message || '電子郵件更新失敗，請重試' };
    } finally {
        emailLoading.value = false;
    }
};

const updatePhone = async () => {
    phoneLoading.value = true;
    message.value = null;

    try {
        await $fetch('/api/account/phone', {
            method: 'POST',
            body: { phone: phoneData.value.phone }
        });
        message.value = { type: 'success', text: '手機號碼更新成功！請檢查您的簡訊進行驗證。' };
        phoneData.value = { phone: '' };
    } catch (error: any) {
        message.value = { type: 'error', text: error.data?.message || '手機號碼更新失敗，請重試' };
    } finally {
        phoneLoading.value = false;
    }
};
</script>

<style scoped>
.security-settings {
    max-width: 600px;
}

.security-settings h2 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 10px;
}

.security-section {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.security-section h3 {
    margin-top: 0;
    color: #333;
    margin-bottom: 15px;
}

.form-group {
    margin-bottom: 15px;
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
