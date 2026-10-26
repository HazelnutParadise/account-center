import { LogtoNextConfig } from "@logto/next";
import {
  getLogtoContext as _getLogtoContext,
  signIn as _signIn,
  signOut as _signOut,
  getAccessTokenRSC as _getAccessTokenRSC,
  handleSignIn as _handleSignIn,
} from "@logto/next/server-actions";

import { createManagementApi } from "@logto/api/management";

// 社群身分結構 - 基於 Logto API 實際響應結構
export interface SocialIdentityData {
  identity: {
    userId: string;
    details?: {
      id: string;
      name: string;
      email: string;
      avatar: string;
      rawData: {
        sub: string;
        name: string;
        email: string;
        picture: string;
        given_name: string;
        family_name: string;
        email_verified: boolean;
      };
    };
  };
  target: string;
  tokenSecret?: {
    tenantId: string;
    id: string;
    userId: string;
    type: string;
    metadata: Record<string, unknown>;
    target: string;
  };
}

export interface SSOIdentityData {
  id: string;
  userId: string;
  issuer: string;
  identityId: string;
  detail: Record<string, unknown>;
  target: string;
  createdAt: number;
  updatedAt: number;
}

export interface AllIdentitiesResponse {
  socialIdentities: SocialIdentityData[];
  ssoIdentities: SSOIdentityData[];
}

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
  baseUrl:
    process.env.NODE_ENV === "production"
      ? process.env.BASE_URL_PROD!
      : process.env.BASE_URL_DEV!,
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
  githubConnectorId: process.env.LOGTO_GITHUB_CONNECTOR_ID!,
  googleConnectorId: process.env.LOGTO_GOOGLE_CONNECTOR_ID!,
};

// 抽出共用 context 初始化
const getManagementContext = async () => {
  const { apiClient, clientCredentials } = createManagementApi("default", {
    clientId: managementAPIConfig.clientId,
    clientSecret: managementAPIConfig.clientSecret,
    baseUrl: managementAPIConfig.logtoEndpoint!,
    apiIndicator: "https://default.logto.app/api",
  });
  const accessToken = (await clientCredentials.getAccessToken()).value;
  const { claims } = await _getLogtoContext(logtoConfig);
  const userId = claims?.sub;
  if (!userId) {
    throw new Error("User ID is missing in token claims");
  }
  return { accessToken, userId, apiClient };
};

export const managementAPI = {
  setPassword: async (password: string) => {
    const { accessToken, userId } = await getManagementContext();
    console.log("Setting password for userId:", userId);
    const res = await fetch(
      `${logtoConfig.endpoint}/api/users/${userId}/password`,
      {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      throw new Error(`${res.status}: ${errorText}`);
    }

    return res.json();
  },
  verifyPassword: async (password: string) => {
    const { accessToken, userId } = await getManagementContext();
    const res = await fetch(
      `${logtoConfig.endpoint}/api/users/${userId}/password/verify`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      throw new Error(`${res.status}: ${errorText}`);
    }

    // 如果是 204 No Content，直接返回成功
    if (res.status === 204) {
      return { success: true };
    }

    // 如果不是 204，嘗試解析 JSON 響應體
    try {
      return await res.json();
    } catch {
      // 如果 JSON 解析失敗，未知錯誤
      return { success: false, message: "Unknown error" };
    }
  },
  getAllIdentities: async () => {
    const { apiClient, userId } = await getManagementContext();
    const res = await apiClient.GET("/api/users/{userId}/all-identities", {
      params: { path: { userId } },
    });
    return res.data;
  },

  // === 社群連接相關 API ===
  createSocialVerification: async (connectorId: string) => {
    const accessToken = await getAccessTokenRSC();
    const state = crypto.randomUUID();
    const redirectUri = `${logtoConfig.baseUrl}/dashboard/profile/social/callback`;

    console.log("Creating social verification with:", {
      connectorId,
      state,
      redirectUri,
    });

    const res = await fetch(
      `${logtoConfig.endpoint}/api/verifications/social`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state,
          redirectUri,
          connectorId,
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error(
        "Failed to create social verification:",
        res.status,
        errorText
      );
      throw new Error(`${res.status}: ${errorText}`);
    }

    const result = await res.json();
    console.log("Social verification created:", {
      verificationRecordId: result.verificationRecordId,
      authorizationUri: result.authorizationUri,
      expiresAt: result.expiresAt,
    });
    console.log("Expect verify to use redirectUri:", redirectUri);

    return result;
  },

  // 直接完成社群身分連接的簡化方法
  completeSocialConnection: async (
    verificationRecordId: string,
    authorizationCode: string,
    state: string,
    connectorId: string
  ) => {
    console.log("Completing social connection:", {
      verificationRecordId,
      connectorId,
      authorizationCode: authorizationCode.substring(0, 20) + "...",
      state,
    });

    // 獲取 Management API context（包含 userId 和 management token）
    const { accessToken: managementToken, userId } =
      await getManagementContext();
    const redirectUri = `${logtoConfig.baseUrl}/dashboard/profile/social/callback`;

    // 直接使用 Management API 連接社群身分
    const res = await fetch(
      `${logtoConfig.endpoint}/api/users/${userId}/identities`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${managementToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connectorId: connectorId,
          connectorData: {
            code: authorizationCode,
            state: state,
            redirectUri: redirectUri,
          },
        }),
      }
    );

    console.log("Link identity response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error("Failed to link social identity:", errorText);

      // 處理特定的錯誤類型
      if (res.status === 422) {
        try {
          const errorData = JSON.parse(errorText);
          console.log("Parsed error data:", errorData);
          if (errorData.code === "user.identity_already_in_use") {
            console.log("Throwing IDENTITY_ALREADY_IN_USE error");
            throw new Error(`IDENTITY_ALREADY_IN_USE: ${errorText}`);
          }
        } catch (parseError) {
          console.error("Failed to parse error data:", parseError);
          // 如果無法解析錯誤，但狀態是422且包含已使用的訊息，仍然拋出特殊錯誤
          if (
            errorText.includes("identity_already_in_use") ||
            errorText.includes("already been associated")
          ) {
            throw new Error(`IDENTITY_ALREADY_IN_USE: ${errorText}`);
          }
        }
      }

      throw new Error(`Link identity failed: ${res.status}: ${errorText}`);
    }

    console.log("Social identity linked successfully");
    return { success: true };
  },

  addSocialIdentity: async (verificationRecordId: string) => {
    const accessToken = await getAccessTokenRSC();

    console.log(
      "Adding social identity with verification record:",
      verificationRecordId
    );

    const res = await fetch(
      `${logtoConfig.endpoint}/api/my-account/identities`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newIdentifierVerificationRecordId: verificationRecordId,
        }),
      }
    );

    console.log("Add social identity response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error("Failed to add social identity:", {
        status: res.status,
        error: errorText,
        verificationRecordId,
      });
      throw new Error(`${res.status}: ${errorText}`);
    }

    console.log("Social identity added successfully");
    return { success: true };
  },

  removeSocialIdentity: async (target: string) => {
    const accessToken = await getAccessTokenRSC();

    const res = await fetch(
      `${logtoConfig.endpoint}/api/my-account/identities/${encodeURIComponent(
        target
      )}`,
      {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      throw new Error(`${res.status}: ${errorText}`);
    }

    // 204 No Content 表示成功
    return { success: true };
  },
};

// === SOCIAL CONNECTORS CONFIG ===

export const getSocialConnectors = () => {
  return [
    {
      id: managementAPIConfig.googleConnectorId,
      name: "Google",
      target: "google",
      icon: "🟢", // 或您可以使用實際的 Google icon
    },
    {
      id: managementAPIConfig.githubConnectorId,
      name: "GitHub",
      target: "github",
      icon: "⚫", // 或您可以使用實際的 GitHub icon
    },
  ].filter((connector) => connector.id); // 過濾掉沒有配置的連接器
};

export const getSocialIdentities = async () => {
  try {
    const identities = await managementAPI.getAllIdentities();
    console.log(
      "Raw identities response:",
      JSON.stringify(identities, null, 2)
    );
    return identities || { socialIdentities: [], ssoIdentities: [] };
  } catch (error) {
    console.error("Failed to get social identities:", error);
    return { socialIdentities: [], ssoIdentities: [] };
  }
};
