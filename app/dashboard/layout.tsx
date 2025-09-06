import { getLogtoContext } from '../logto';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
  const { isAuthenticated } = await getLogtoContext();

  if (!isAuthenticated) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 側邊導航欄 */}
      <div className="flex">
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              帳號中心
            </h2>
            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                📊 總覽
              </Link>
              <Link
                href="/dashboard/profile"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                👤 個人資料
              </Link>
              <Link
                href="/dashboard/security"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                🔒 安全設定
              </Link>
              <Link
                href="/dashboard/settings"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                ⚙️ 偏好設定
              </Link>
            </nav>
          </div>
        </aside>

        {/* 主要內容區域 */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
