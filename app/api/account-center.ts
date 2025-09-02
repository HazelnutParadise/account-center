const API_BASE_URL = 'https://auth.hazelnut-paradise.com/api/account-center'; // Updated to match API endpoint
export const accountCenterApi = {
    getUserInfo: async (userToken: string) => {
        try {
            // Fetch user information from the API
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw error;
        }
    },
    updateUserInfo: async (data: any) => {
        // Update user information via the API
    }
}
