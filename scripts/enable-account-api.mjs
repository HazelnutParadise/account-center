// get-m2m-token.mjs
import 'dotenv/config';

const baseUrl = process.env.LOGTO_BASE_URL;        // 例：https://auth.hazelnut-paradise.com
const clientId = process.env.LOGTO_M2M_CLIENT_ID;  // 你的 M2M app id
const clientSecret = process.env.LOGTO_M2M_CLIENT_SECRET;

if (!baseUrl || !clientId || !clientSecret) {
  throw new Error('請設定 LOGTO_BASE_URL / LOGTO_M2M_CLIENT_ID / LOGTO_M2M_CLIENT_SECRET');
}

const tokenEndpoint = `${baseUrl.replace(/\/+$/, '')}/oidc/token`;
// ★ 自架固定用這個 resource
const mgmtResource = 'https://default.logto.app/api';

const resp = await fetch(tokenEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    // 方式一：用 Basic Auth（推薦）
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
  },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    resource: mgmtResource,
    scope: 'all', // 建議帶，前提是你已把對應權限/角色指派給這個 M2M
  }).toString(),
});

const data = await resp.json();
if (!resp.ok) {
  console.error('拿 token 失敗：', data);
  process.exit(1);
}
const accessToken = data.access_token;
console.log('✅ access_token:', accessToken);

// -------------------------
// 直接開啟 Account API
// -------------------------

const accountCenterUrl = `${baseUrl.replace(/\/+$/, '')}/api/account-center`;

// 2) 開啟 Account API
const patchBody = {
  enabled: true,
  fields: {
    username: 'Edit',
    name: 'Edit',
    avatar: 'Edit',
    email: 'Edit',
    phone: 'Edit',
    password: 'Edit',
    social: 'Edit',
    mfa: 'Edit',
  },
};

const patchResp = await fetch(accountCenterUrl, {
  method: 'PATCH',
  headers: {
    authorization: `Bearer ${accessToken}`,
    'content-type': 'application/json',
  },
  body: JSON.stringify(patchBody),
});
const patchResult = await patchResp.json();
console.log('✅ PATCH 結果:', patchResult);

// 3) 驗證狀態
const getResp = await fetch(accountCenterUrl, {
  headers: { authorization: `Bearer ${accessToken}` },
});
const getResult = await getResp.json();
console.log('🎉 目前狀態:', getResult);
