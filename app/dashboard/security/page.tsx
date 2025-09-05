import { getLogtoContext, getAccessTokenRSC } from '@logto/next/server-actions';
import { logtoConfig, getAccountInfo } from '../../logto';

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

const Security = async() => {
  const { isAuthenticated } = await getLogtoContext(logtoConfig);
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
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          安全設定
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          管理您的密碼和安全選項
        </p>
      </header>

      {accountInfo && 'error' in accountInfo ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-lg font-medium mb-2">
            取得帳號資訊失敗
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {accountInfo.error}
          </p>
        </div>
      ) : accountInfo ? (
        <div className="space-y-6">
          {/* 密碼設定 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">
                密碼管理
              </h3>
            </div>
            <div className="p-6">
              {accountInfo.hasPassword ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
                        密碼已設定
                      </h4>
                      <p className="text-green-600 dark:text-green-300 text-sm">
                        您的帳號已經設定了密碼，提供額外的安全保護。
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      變更密碼
                    </h4>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          目前密碼
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="請輸入目前密碼"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          新密碼
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="請輸入新密碼"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          確認新密碼
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="請再次輸入新密碼"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        更新密碼
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div>
                      <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                        未設定密碼
                      </h4>
                      <p className="text-yellow-600 dark:text-yellow-300 text-sm">
                        建議設定密碼以提升帳號安全性。
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⚠️</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      設定密碼
                    </h4>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          新密碼
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="請輸入新密碼"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          確認新密碼
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="請再次輸入新密碼"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        設定密碼
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 登入記錄 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">
                登入記錄
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      最後登入
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {new Date(accountInfo.lastSignInAt).toLocaleString('zh-TW')}
                    </p>
                  </div>
                  <div className="text-green-600 dark:text-green-400">
                    <span className="text-2xl">🟢</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      帳號創建
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {new Date(accountInfo.createdAt).toLocaleString('zh-TW')}
                    </p>
                  </div>
                  <div className="text-blue-600 dark:text-blue-400">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 安全建議 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">
                安全建議
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${accountInfo.hasPassword ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{accountInfo.hasPassword ? '✅' : '⚠️'}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {accountInfo.hasPassword ? '密碼已設定' : '建議設定密碼'}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {accountInfo.hasPassword
                          ? '您的帳號已經有密碼保護，安全性良好。'
                          : '設定密碼可以提升您的帳號安全性，建議盡快設定。'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        定期變更密碼
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        建議每 3-6 個月變更一次密碼，保持帳號安全。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">載入中...</p>
        </div>
      )}
    </div>
  );
};

export default Security;
