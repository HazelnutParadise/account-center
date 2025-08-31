const API_BASE_URL = 'https://auth.hazelnut-paradise.com/api/accountCenter'; // Replace with your actual API base URL
export const accountCenterApi = {
    getUserInfo: async (userToken: string) => {
        // Fetch user information from the API
        const response = await fetch(`${API_BASE_URL}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });
        return response.json();
    },
    updateUserInfo: async (data: any) => {
        // Update user information via the API
    }
}
