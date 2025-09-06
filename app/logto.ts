import { LogtoNextConfig } from "@logto/next";
import {
  getLogtoContext as _getLogtoContext,
  signIn as _signIn,
  signOut as _signOut,
  getAccessTokenRSC as _getAccessTokenRSC,
  handleSignIn as _handleSignIn,
} from "@logto/next/server-actions";

import { createManagementApi } from "@logto/api/management";

// Logto API 回傳的帳號資訊結構
export interface AccountInfo {
  id: string;
  username: string;
  name: string;
  avatar: string;
  lastSignInAt: number;
  createdAt: number;
  updatedAt: number;
  profile: {
    familyName?: string;
    givenName?: string;
    middleName?: string;
    nickname?: string;
    preferredUsername?: string;
    profile?: string;
    website?: string;
    gender?: string;
    birthdate?: string;
    zoneinfo?: string;
    locale?: string;
  };
  applicationId: string;
  isSuspended: boolean;
  hasPassword: boolean;
  primaryEmail?: string;
  primaryPhone?: string;
}

export const logtoConfig: LogtoNextConfig = {
  endpoint: process.env.LOGTO_ENDPOINT!,
  appId: process.env.LOGTO_APP_ID!,
  appSecret: process.env.LOGTO_APP_SECRET!,
  baseUrl: process.env.LOGTO_BASE_URL!,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET!,
  cookieSecure: process.env.NODE_ENV === "production",
  scopes: ["openid", "profile", "email", "phone", "custom_data"],
};

// 集中化的 Logto 認證相關呼叫
export const getLogtoContext = () => _getLogtoContext(logtoConfig);
export const signIn = () => _signIn(logtoConfig);
export const signOut = () => _signOut(logtoConfig);
export const handleSignIn = (searchParams: URLSearchParams) =>
  _handleSignIn(logtoConfig, searchParams);

// 內部 accessToken 獲取函數，不對外暴露
const getAccessTokenRSC = () => _getAccessTokenRSC(logtoConfig);

export const getAccountInfo = async () => {
  const accessToken = await getAccessTokenRSC();
  const res = await fetch(`${logtoConfig.endpoint}/api/my-account`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error("取得帳號資訊失敗");
  const info = await res.json();
  console.log("Account Info:", info);
  return info;
};

export const updateAccountInfo = async (data: {
  username?: string;
  name?: string;
  avatar?: string | null;
  customData?: Record<string, unknown>;
}) => {
  // 過濾處理資料，只保留有意義的值
  const filteredData: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "string") {
      if (key === "username") {
        // username 不能為空，如果為空則不更新
        const trimmedValue = value.trim();
        if (trimmedValue) {
          filteredData[key] = trimmedValue;
        }
      } else {
        // name 和 avatar 接受所有字串值（包括空字串用於清空）
        filteredData[key] = value;
      }
    } else if (value !== undefined) {
      filteredData[key] = value;
    }
  });

  console.log("Updating account with data:", filteredData);

  const accessToken = await getAccessTokenRSC();
  const res = await fetch(`${logtoConfig.endpoint}/api/my-account`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filteredData),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    console.error("Account update failed:", res.status, errorText);
    throw new Error(`更新帳號資訊失敗: ${res.status} - ${errorText}`);
  }

  return res.json();
};

export const updateProfileInfo = async (data: {
  familyName?: string;
  givenName?: string;
  middleName?: string;
  nickname?: string;
  preferredUsername?: string;
  profile?: string;
  website?: string;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
}) => {
  // 過濾掉 undefined 值，只保留有意義的值
  const filteredData: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "string" && value !== undefined) {
      // 保留所有定義的字串值（包括空字串，用於清空）
      filteredData[key] = value;
    }
  });

  console.log("Updating profile with data:", filteredData);

  const accessToken = await getAccessTokenRSC();
  const res = await fetch(`${logtoConfig.endpoint}/api/my-account/profile`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filteredData),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    const errorData = {
      status: res.status,
      statusText: res.statusText,
      body: errorText,
    };
    console.error("Profile update failed:", errorData);
    console.error("Request data was:", filteredData);
    throw new Error(
      `更新個人資料失敗: ${res.status} ${res.statusText} - ${errorText}`
    );
  }

  return res.json();
};

// === MANAGEMENT API ===

const managementAPIConfig = {
  clientId: process.env.LOGTO_M2M_CLIENT_ID!,
  clientSecret: process.env.LOGTO_M2M_CLIENT_SECRET!,
  logtoEndpoint: process.env.LOGTO_ENDPOINT!,
};

const {
  apiClient: managementApiClient,
  clientCredentials: managementApiClientCredentials,
} = createManagementApi("default", {
  clientId: managementAPIConfig.clientId,
  clientSecret: managementAPIConfig.clientSecret,
  baseUrl: managementAPIConfig.logtoEndpoint,
  apiIndicator: "https://default.logto.app/api",
});

export const setPassword = async (password: string) => {
  const accessToken = await getAccessTokenRSC();
  const res = await fetch(`${logtoConfig.endpoint}/api/my-account/password`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`${res.status}: ${errorText}`);
  }

  return res.json();
};
