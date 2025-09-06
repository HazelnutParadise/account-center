import {
  getLogtoContext,
  signOut,
  getAccountInfo,
  AccountInfo
} from "../logto";
import SignOut from "../sign-out";
import Link from "next/link";
import Avatar from "./components/Avatar";

const Dashboard = async () => {
  const { isAuthenticated, claims } = await getLogtoContext();
  let accountInfo: AccountInfo | { error: string } | null = null;
  if (isAuthenticated) {
    try {
      accountInfo = await getAccountInfo();
    } catch {
      accountInfo = { error: "取得帳號資訊失敗" };
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          帳號總覽
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          管理您的帳號資訊和設定
        </p>
      </header>

      <div className="space-y-6">
        {/* 歡迎卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {claims?.name?.charAt(0) ||
                    claims?.username?.charAt(0) ||
                    "U"}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  歡迎回來，{claims?.name || claims?.username}！
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  您的用戶 ID: {claims?.sub}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/profile?edit=true"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                編輯資料
              </Link>
              <SignOut
                onSignOut={async () => {
                  "use server";
                  await signOut();
                }}
              />
            </div>
          </div>
        </div>

        {/* 快速操作卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/profile"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                個人資料
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                編輯您的個人資訊
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/security"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                安全設定
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                管理密碼和安全選項
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/settings"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                偏好設定
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                自訂您的使用偏好
              </p>
            </div>
          </Link>
        </div>

        {/* 帳號資訊卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h3 className="text-xl font-semibold text-white">帳號資訊</h3>
          </div>
          <div className="p-6">
            {accountInfo && "error" in accountInfo ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-lg font-medium mb-2">
                  取得帳號資訊失敗
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {accountInfo.error}
                </p>
              </div>
            ) : accountInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本資訊 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Avatar
                        src={accountInfo.avatar}
                        alt="Avatar"
                        name={accountInfo.name || accountInfo.username}
                        size={80}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {accountInfo.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        @{accountInfo.username}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        用戶 ID
                      </div>
                      <div className="font-mono text-sm text-gray-900 dark:text-white">
                        {accountInfo.id}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        應用程式 ID
                      </div>
                      <div className="font-mono text-sm text-gray-900 dark:text-white">
                        {accountInfo.applicationId}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 詳細資訊 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {accountInfo.primaryEmail && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          電子郵件
                        </div>
                        <div className="text-gray-900 dark:text-white">
                          {accountInfo.primaryEmail}
                        </div>
                      </div>
                    )}

                    {accountInfo.primaryPhone && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          電話號碼
                        </div>
                        <div className="text-gray-900 dark:text-white">
                          {accountInfo.primaryPhone}
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        最後登入
                      </div>
                      <div className="text-gray-900 dark:text-white">
                        {new Date(accountInfo.lastSignInAt).toLocaleString(
                          "zh-TW"
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        帳號創建
                      </div>
                      <div className="text-gray-900 dark:text-white">
                        {new Date(accountInfo.createdAt).toLocaleString(
                          "zh-TW"
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 狀態標籤 */}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        accountInfo.isSuspended
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {accountInfo.isSuspended ? "已停權" : "正常"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        accountInfo.hasPassword
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {accountInfo.hasPassword ? "有密碼" : "無密碼"}
                    </span>
                  </div>
                  {!accountInfo.hasPassword && (
                    <Link
                      href="/dashboard/security"
                      className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      設定密碼
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">載入中...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
