import { LogtoNextConfig } from '@logto/next';

export const logtoConfig: LogtoNextConfig = {
  endpoint: process.env.LOGTO_ENDPOINT,
  appId: process.env.LOGTO_APP_ID,
  appSecret: process.env.LOGTO_APP_SECRET,
  baseUrl: process.env.LOGTO_BASE_URL,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET,
  cookieSecure: process.env.NODE_ENV === 'production',
  scopes: ['openid', 'profile', 'email', 'phone', 'custom_data'],
};  

export const getAccountInfo = async (accessToken: string) => {
  const res = await fetch('https://auth.hazelnut-paradise.com/api/my-account', {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('取得帳號資訊失敗');
  const info = await res.json();
  console.log('Account Info:', info);
  return info;
}

export const updateAccountInfo = async (accessToken: string, data: {
  username?: string;
  name?: string;
  avatar?: string;
  customData?: Record<string, unknown>;
}) => {
  const res = await fetch('https://auth.hazelnut-paradise.com/api/my-account', {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('更新帳號資訊失敗');
  return res.json();
};

export const updateProfileInfo = async (accessToken: string, data: {
  familyName?: string;
  givenName?: string;
  middleName?: string;
  nickname?: string;
  profile?: string;
  website?: string;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  address?: {
    streetAddress?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
}) => {
  const res = await fetch('https://auth.hazelnut-paradise.com/api/my-account/profile', {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('更新個人資料失敗');
  return res.json();
};