import { getLogtoContext, signIn, signOut, getAccessTokenRSC } from '@logto/next/server-actions';
import SignIn from './sign-in';
import SignOut from './sign-out';
import { logtoConfig,getAccountInfo } from './logto';
import Image from 'next/image';

interface AccountInfo {
  id: string;
  username: string;
  name: string;
  avatar: string;
  lastSignInAt: number;
  createdAt: number;
  updatedAt: number;
  profile: Record<string, unknown>;
  applicationId: string;
  isSuspended: boolean;
  hasPassword: boolean;
  email?: string;
  phone?: string;
}

const Home = async() => {
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);
  let accountInfo: AccountInfo | { error: string } | null = null;
  if (isAuthenticated) {
    const accessToken = await getAccessTokenRSC(logtoConfig);
    try {
      accountInfo = await getAccountInfo(accessToken);
    } catch {
      accountInfo = { error: '取得帳號資訊失敗' };
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              帳號中心
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              管理您的帳號資訊和設定
            </p>
          </header>

          {isAuthenticated ? (
            <div className="space-y-6">
              {/* 歡迎卡片 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {claims?.name?.charAt(0) || claims?.username?.charAt(0) || 'U'}
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
                  <div className="flex-shrink-0">
                    <SignOut
                      onSignOut={async () => {
                        'use server';
                        await signOut(logtoConfig);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 帳號資訊卡片 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white">
                    帳號資訊
                  </h3>
                </div>
                <div className="p-6">
                  {accountInfo && 'error' in accountInfo ? (
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
                            <Image
                              src={accountInfo.avatar}
                              alt="Avatar"
                              width={80}
                              height={80}
                              className="rounded-full border-4 border-gray-200 dark:border-gray-600"
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
                            <div className="text-sm text-gray-500 dark:text-gray-400">用戶 ID</div>
                            <div className="font-mono text-sm text-gray-900 dark:text-white">
                              {accountInfo.id}
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="text-sm text-gray-500 dark:text-gray-400">應用程式 ID</div>
                            <div className="font-mono text-sm text-gray-900 dark:text-white">
                              {accountInfo.applicationId}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 詳細資訊 */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          {accountInfo.email && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <div className="text-sm text-gray-500 dark:text-gray-400">電子郵件</div>
                              <div className="text-gray-900 dark:text-white">{accountInfo.email}</div>
                            </div>
                          )}

                          {accountInfo.phone && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <div className="text-sm text-gray-500 dark:text-gray-400">電話號碼</div>
                              <div className="text-gray-900 dark:text-white">{accountInfo.phone}</div>
                            </div>
                          )}

                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="text-sm text-gray-500 dark:text-gray-400">最後登入</div>
                            <div className="text-gray-900 dark:text-white">
                              {new Date(accountInfo.lastSignInAt).toLocaleString('zh-TW')}
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="text-sm text-gray-500 dark:text-gray-400">帳號創建時間</div>
                            <div className="text-gray-900 dark:text-white">
                              {new Date(accountInfo.createdAt).toLocaleString('zh-TW')}
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="text-sm text-gray-500 dark:text-gray-400">最後更新</div>
                            <div className="text-gray-900 dark:text-white">
                              {new Date(accountInfo.updatedAt).toLocaleString('zh-TW')}
                            </div>
                          </div>
                        </div>

                        {/* 狀態標籤 */}
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            accountInfo.isSuspended
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {accountInfo.isSuspended ? '已停權' : '正常'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            accountInfo.hasPassword
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {accountInfo.hasPassword ? '有密碼' : '無密碼'}
                          </span>
                          {!accountInfo.hasPassword && (
                            <button className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors">
                              設定密碼
                            </button>
                          )}
                        </div>
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

              {/* 個人資料卡片 */}
              {accountInfo && !('error' in accountInfo) && accountInfo.profile && Object.keys(accountInfo.profile).length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
                    <h3 className="text-xl font-semibold text-white">
                      個人資料
                    </h3>
                  </div>
                  <div className="p-6">
                    <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(accountInfo.profile, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                  AC
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  歡迎使用帳號中心
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  請登入以查看您的帳號資訊
                </p>
              </div>
              <SignIn
                onSignIn={async () => {
                  'use server';
                  await signIn(logtoConfig);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;