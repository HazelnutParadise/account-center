import { getLogtoContext, getAccessTokenRSC } from '@logto/next/server-actions';
import { logtoConfig, getAccountInfo } from '../../logto';
import Image from 'next/image';
import Link from 'next/link';

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

const Profile = async() => {
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
          編輯個人資料
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          更新您的帳號資訊和個人設定
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
          {/* 基本資訊編輯 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">
                基本資訊
              </h3>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 頭像區域 */}
                  <div className="md:col-span-2 flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      <Image
                        src={accountInfo.avatar}
                        alt="Avatar"
                        width={100}
                        height={100}
                        className="rounded-full border-4 border-gray-200 dark:border-gray-600"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        個人頭像
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        您的頭像會自動從 Google 帳號同步
                      </p>
                      <button
                        type="button"
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        更換頭像
                      </button>
                    </div>
                  </div>

                  {/* 姓名 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      姓名
                    </label>
                    <input
                      type="text"
                      defaultValue={accountInfo.name}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="請輸入您的姓名"
                    />
                  </div>

                  {/* 用戶名 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      用戶名
                    </label>
                    <input
                      type="text"
                      defaultValue={accountInfo.username}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="請輸入用戶名"
                    />
                  </div>

                  {/* 電子郵件 */}
                  {accountInfo.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        電子郵件
                      </label>
                      <input
                        type="email"
                        defaultValue={accountInfo.email}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="請輸入電子郵件"
                      />
                    </div>
                  )}

                  {/* 電話號碼 */}
                  {accountInfo.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        電話號碼
                      </label>
                      <input
                        type="tel"
                        defaultValue={accountInfo.phone}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="請輸入電話號碼"
                      />
                    </div>
                  )}
                </div>

                {/* 提交按鈕 */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <Link
                    href="/dashboard"
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    取消
                  </Link>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    儲存變更
                  </button>
                </div>
              </form>
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

export default Profile;
