import { useLogtoUser, useLogtoClient } from '#imports';
import { ref, onMounted, nextTick } from 'vue';
import { navigateTo } from 'nuxt/app';

export function useAccount(customLoadSpecificData?: () => Promise<void>) {
    const user = useLogtoUser();
    const client = useLogtoClient();
    const accessToken = useState<string | undefined>('access-token');
    const loading = ref(true);
    const hasLoaded = ref(false);

    async function signOut() {
        await navigateTo('/auth/sign-out');
    }

    async function loadSpecificData() {
        if (customLoadSpecificData) {
            await customLoadSpecificData();
        }
        // 預設空實現
    }

    async function loadUserData() {
        console.log('loadUserData 開始執行');
        console.log('user:', user);

        if (!user || !user.sub) {
            console.log('用戶未登入，重定向到登入頁面');
            loading.value = false;
            await navigateTo('/auth/sign-in');
            return;
        }

        console.log('用戶已登入，開始取得帳戶資訊');

        try {
            await loadSpecificData();
            console.log('成功取得帳戶資訊');
        } catch (error) {
            console.error('API 請求發生錯誤:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
                console.log('授權錯誤，重新導向至登入頁面');
                await navigateTo('/auth/sign-in');
            }
        } finally {
            loading.value = false;
            console.log('loadUserData 完成，loading 設定為 false');
        }
    }

    onMounted(async () => {
        console.log('onMounted 觸發');
        await nextTick();
        console.log('nextTick 完成');
        console.log('process.client:', process.client);
        console.log('user:', user);
        console.log('hasLoaded:', hasLoaded.value);

        if (user && !hasLoaded.value) {
            console.log('條件滿足，開始載入用戶資料');
            hasLoaded.value = true;
            await loadUserData();

            if (accessToken.value === undefined) {
                accessToken.value = await client.getAccessToken();
            }
        } else {
            console.log('條件不滿足，原因:');
            console.log('- user:', !!user);
            console.log('- hasLoaded:', hasLoaded.value);
            // 如果沒有用戶，停止載入動畫
            if (!user) {
                loading.value = false;
            }
        }
    });

    return {
        user,
        client,
        accessToken,
        loading,
        hasLoaded,
        signOut,
        loadUserData
    };
}
