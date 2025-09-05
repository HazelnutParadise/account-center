const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          偏好設定
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          自訂您的使用偏好和介面設定
        </p>
      </header>

      <div className="space-y-6">
        {/* 外觀設定 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h3 className="text-xl font-semibold text-white">
              外觀設定
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  主題模式
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white border border-gray-300 rounded-full mx-auto mb-2"></div>
                      <h5 className="font-medium text-gray-900 dark:text-white">淺色模式</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">明亮介面</p>
                    </div>
                  </div>
                  <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-900 border border-gray-600 rounded-full mx-auto mb-2"></div>
                      <h5 className="font-medium text-gray-900 dark:text-white">深色模式</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">暗色介面</p>
                    </div>
                  </div>
                  <div className="p-4 border-2 border-blue-500 rounded-lg cursor-pointer">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-white to-gray-900 rounded-full mx-auto mb-2"></div>
                      <h5 className="font-medium text-gray-900 dark:text-white">自動</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">跟隨系統</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  語言設定
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      介面語言
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="zh-TW">繁體中文</option>
                      <option value="zh-CN">簡體中文</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 通知設定 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
            <h3 className="text-xl font-semibold text-white">
              通知設定
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    電子郵件通知
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    接收帳號相關的通知郵件
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    安全提醒
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    當有可疑登入時通知您
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    產品更新
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    接收新功能和更新的通知
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 隱私設定 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
            <h3 className="text-xl font-semibold text-white">
              隱私設定
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    資料分析
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    幫助我們改善服務品質
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    行銷資訊
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    接收個人化的產品推薦
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 儲存按鈕 */}
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            儲存設定
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
