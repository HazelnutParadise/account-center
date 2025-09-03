<template>
    <AccountLayout>
        <section class="mfa-settings">
            <h2>多因素驗證 (MFA)</h2>
            <p>啟用多因素驗證以增加帳號安全性。</p>

            <div v-if="!mfaEnabled" class="mfa-setup">
                <h3>設定 MFA</h3>
                <p>掃描下面的 QR 碼，或手動輸入金鑰到您的驗證器應用程式。</p>

                <div v-if="qrCode" class="qr-container">
                    <img :src="qrCode" alt="MFA QR Code" />
                </div>

                <div v-if="secret" class="secret-key">
                    <p><strong>金鑰：</strong> {{ secret }}</p>
                    <button @click="copySecret" class="btn btn-secondary">複製金鑰</button>
                </div>

                <form v-if="setupStep === 1" @submit.prevent="verifySetup" class="verify-form">
                    <div class="form-group">
                        <label for="code">輸入驗證碼</label>
                        <input id="code" v-model="verificationCode" type="text" placeholder="輸入 6 位數字驗證碼" required />
                    </div>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        {{ loading ? '驗證中...' : '啟用 MFA' }}
                    </button>
                </form>

                <button v-if="!qrCode" @click="startSetup" class="btn btn-primary">
                    開始設定 MFA
                </button>
            </div>

            <div v-else class="mfa-enabled">
                <h3>MFA 已啟用</h3>
                <p>您的帳號已啟用多因素驗證。</p>
                <button @click="disableMFA" class="btn btn-secondary">
                    停用 MFA
                </button>
            </div>

            <div v-if="message" class="message" :class="{ error: message.type === 'error' }">
                {{ message.text }}
            </div>
        </section>
    </AccountLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAccount } from '../../composables/useAccount';

const { user } = useAccount();
const mfaEnabled = ref(false);
const qrCode = ref('');
const secret = ref('');
const setupStep = ref(0);
const verificationCode = ref('');
const loading = ref(false);
const message = ref<{ type: string; text: string } | null>(null);

const startSetup = async () => {
    loading.value = true;
    message.value = null;

    try {
        const response = await $fetch('/api/account/verification/mfa/setup') as { qrCode: string; secret: string };
        qrCode.value = response.qrCode;
        secret.value = response.secret;
        setupStep.value = 1;
    } catch (error: any) {
        message.value = { type: 'error', text: error.data?.message || '設定 MFA 失敗，請重試' };
    } finally {
        loading.value = false;
    }
};

const verifySetup = async () => {
    loading.value = true;
    message.value = null;

    try {
        await $fetch('/api/account/verification/mfa/verify', {
            method: 'POST',
            body: { code: verificationCode.value }
        });
        message.value = { type: 'success', text: 'MFA 啟用成功！' };
        mfaEnabled.value = true;
        qrCode.value = '';
        secret.value = '';
        setupStep.value = 0;
        verificationCode.value = '';
    } catch (error: any) {
        message.value = { type: 'error', text: error.data?.message || '驗證失敗，請重試' };
    } finally {
        loading.value = false;
    }
};

const disableMFA = async () => {
    if (!confirm('確定要停用多因素驗證嗎？這將降低您的帳號安全性。')) {
        return;
    }

    loading.value = true;
    message.value = null;

    try {
        await $fetch('/api/account/verification/mfa/disable', {
            method: 'POST'
        });
        message.value = { type: 'success', text: 'MFA 已停用' };
        mfaEnabled.value = false;
    } catch (error: any) {
        message.value = { type: 'error', text: error.data?.message || '停用 MFA 失敗，請重試' };
    } finally {
        loading.value = false;
    }
};

const copySecret = () => {
    navigator.clipboard.writeText(secret.value);
    message.value = { type: 'success', text: '金鑰已複製到剪貼簿' };
};

onMounted(async () => {
    try {
        const response = await $fetch('/api/account/me') as { mfaEnabled?: boolean };
        mfaEnabled.value = response.mfaEnabled || false;
    } catch (error) {
        console.error('Failed to check MFA status:', error);
    }
});
</script>

<style scoped>
.mfa-settings {
    max-width: 600px;
}

.mfa-settings h2 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 10px;
}

.mfa-settings p {
    color: #666;
    margin-bottom: 20px;
}

.mfa-setup,
.mfa-enabled {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.mfa-setup h3,
.mfa-enabled h3 {
    margin-top: 0;
    color: #333;
    margin-bottom: 15px;
}

.qr-container {
    text-align: center;
    margin: 20px 0;
}

.qr-container img {
    max-width: 200px;
    height: auto;
}

.secret-key {
    background: #fff;
    padding: 15px;
    border-radius: 4px;
    margin: 20px 0;
    border: 1px solid #ddd;
}

.secret-key p {
    margin: 0 0 10px 0;
    word-break: break-all;
}

.verify-form {
    margin-top: 20px;
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
    text-align: center;
    letter-spacing: 2px;
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
