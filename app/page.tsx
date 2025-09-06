import { getLogtoContext, signIn } from './logto';
import { redirect } from 'next/navigation';
import SignIn from './sign-in';

const Home = async() => {
  const { isAuthenticated } = await getLogtoContext();

  if (isAuthenticated) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              帳號中心
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              管理您的帳號資訊和設定
            </p>
          </header>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-content mx-auto mb-4">
                <span className="text-2xl sm:text-4xl font-bold text-white">AC</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                歡迎使用帳號中心
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
                請登入以查看您的帳號資訊
              </p>
            </div>
            <SignIn
              onSignIn={async () => {
                'use server';
                await signIn();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;