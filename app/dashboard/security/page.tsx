import {
  getLogtoContext,
  getAccountInfo,
  AccountInfo,
  managementAPI,
} from "../../logto";
import { redirect } from "next/navigation";

const setUserPassword = async (formData: FormData) => {
  "use server";

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    redirect("/dashboard/security?error=missing_fields");
  }

  if (password !== confirmPassword) {
    redirect("/dashboard/security?error=password_mismatch");
  }

  if (password.length < 8) {
    redirect("/dashboard/security?error=password_too_short");
  }

  try {
    await managementAPI.setPassword(password);
  } catch (error) {
    console.error("設定密碼失敗:", error);
    // 提供更詳細的錯誤信息
    let errorType = "set_password_failed";
    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("403")) {
        errorType = "auth_failed";
      } else if (error.message.includes("400")) {
        errorType = "invalid_password";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorType = "network_error";
      }
    }
    redirect(`/dashboard/security?error=${errorType}`);
  }

  redirect("/dashboard/security?success=true");
};

const updateUserPassword = async (formData: FormData) => {
  "use server";

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmNewPassword = formData.get("confirmNewPassword") as string;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    redirect("/dashboard/security?error=missing_fields");
  }

  if (newPassword !== confirmNewPassword) {
    redirect("/dashboard/security?error=password_mismatch");
  }

  if (newPassword.length < 8) {
    redirect("/dashboard/security?error=password_too_short");
  }

  // 檢查新密碼是否與當前密碼相同
  if (currentPassword === newPassword) {
    redirect("/dashboard/security?error=same_password");
  }

  try {
    // 首先驗證當前密碼
    await managementAPI.verifyPassword(currentPassword);
    
    // 驗證成功後，設定新密碼
    await managementAPI.setPassword(newPassword);
  } catch (error) {
    console.error("更新密碼失敗:", error);
    // 提供更詳細的錯誤信息
    let errorType = "update_password_failed";
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      // 檢查是否是密碼驗證失敗 (422 錯誤或 invalid_credentials)
      if (errorMessage.includes("422") || 
          errorMessage.includes("invalid_credentials") ||
          errorMessage.includes("incorrect account or password")) {
        errorType = "current_password_incorrect";
      } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
        errorType = "current_password_incorrect";
      } else if (errorMessage.includes("400")) {
        errorType = "invalid_password";
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        errorType = "network_error";
      }
    }
    redirect(`/dashboard/security?error=${errorType}`);
  }

  redirect("/dashboard/security?success=password_updated");
};

const Security = async ({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) => {
  const { isAuthenticated } = await getLogtoContext();
  let accountInfo: AccountInfo | { error: string } | null = null;

  if (isAuthenticated) {
    try {
      accountInfo = await getAccountInfo();
    } catch {
      accountInfo = { error: "取得帳號資訊失敗" };
    }
  }

  const params = await searchParams;

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          安全設定
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          管理您的密碼和安全選項
        </p>
      </header>

      {params?.success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <h4 className="text-green-800 dark:text-green-200 font-semibold">
                {params.success === "password_updated" && "密碼更新成功"}
                {params.success === "true" && "密碼設定成功"}
              </h4>
              <p className="text-green-600 dark:text-green-300 text-sm">
                {params.success === "password_updated" && "您的密碼已成功更新"}
                {params.success === "true" && "您的密碼已成功設定"}
              </p>
            </div>
          </div>
        </div>
      )}

      {params?.error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">❌</span>
            <div>
              <h4 className="text-red-800 dark:text-red-200 font-semibold">
                {params.error === "password_mismatch" && "密碼確認不相符"}
                {params.error === "missing_fields" && "請填寫所有必填欄位"}
                {params.error === "password_too_short" &&
                  "密碼長度至少需要 8 個字符"}
                {params.error === "set_password_failed" && "設定密碼失敗"}
                {params.error === "update_password_failed" && "更新密碼失敗"}
                {params.error === "current_password_incorrect" && "當前密碼不正確"}
                {params.error === "same_password" && "新密碼不能與當前密碼相同"}
                {params.error === "auth_failed" && "認證失敗"}
                {params.error === "invalid_password" && "密碼不符合要求"}
                {params.error === "network_error" && "網路連接錯誤"}
              </h4>
              <p className="text-red-600 dark:text-red-300 text-sm">
                {params.error === "password_mismatch" &&
                  "請確認新密碼和確認密碼相同"}
                {params.error === "missing_fields" &&
                  "請填寫所有必填欄位"}
                {params.error === "password_too_short" &&
                  "密碼長度至少需要 8 個字符"}
                {params.error === "set_password_failed" &&
                  "設定密碼時發生未知錯誤，請稍後再試"}
                {params.error === "update_password_failed" &&
                  "更新密碼時發生未知錯誤，請稍後再試"}
                {params.error === "current_password_incorrect" &&
                  "您輸入的當前密碼不正確，請檢查後重新輸入"}
                {params.error === "same_password" &&
                  "新密碼必須與當前密碼不同"}
                {params.error === "auth_failed" &&
                  "認證已過期，請重新登入後再試"}
                {params.error === "invalid_password" &&
                  "密碼不符合系統要求，請檢查密碼強度"}
                {params.error === "network_error" &&
                  "網路連接失敗，請檢查網路連接後再試"}
              </p>
            </div>
          </div>
        </div>
      )}

      {accountInfo && "error" in accountInfo ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-lg font-medium mb-2">
            取得帳號資訊失敗
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {accountInfo.error}
          </p>
        </div>
      ) : accountInfo ? (
        <div className="space-y-4 sm:space-y-6">
          {/* 密碼設定 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">密碼管理</h3>
            </div>
            <div className="p-4 sm:p-6">
              {accountInfo.hasPassword ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-3 sm:space-y-0">
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-200">
                        密碼已設定
                      </h4>
                      <p className="text-green-600 dark:text-green-300 text-xs sm:text-sm">
                        您的帳號已經設定了密碼，提供額外的安全保護。
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                      <span className="text-xl sm:text-2xl">✅</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      變更密碼
                    </h4>
                    <form action={updateUserPassword} className="space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          目前密碼 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                          placeholder="請輸入目前密碼"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          新密碼 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          required
                          minLength={8}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                          placeholder="請輸入新密碼（至少 8 個字符）"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          確認新密碼 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirmNewPassword"
                          required
                          minLength={8}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                          placeholder="請再次輸入新密碼"
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-500 text-xs sm:text-sm">💡</span>
                          <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm">
                            <strong>密碼要求：</strong>至少 8 個字符，建議包含大小寫字母、數字和特殊符號
                          </p>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm sm:text-base"
                      >
                        更新密碼
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg space-y-3 sm:space-y-0">
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                        未設定密碼
                      </h4>
                      <p className="text-yellow-600 dark:text-yellow-300 text-xs sm:text-sm">
                        建議設定密碼以提升帳號安全性。
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                      <span className="text-xl sm:text-2xl">⚠️</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      設定密碼
                    </h4>
                    <form action={setUserPassword} className="space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          新密碼 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          required
                          minLength={8}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                          placeholder="請輸入新密碼（至少 8 個字符）"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          確認新密碼 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          minLength={8}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                          placeholder="請再次輸入新密碼"
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-500 text-xs sm:text-sm">💡</span>
                          <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm">
                            <strong>密碼要求：</strong>至少 8 個字符，建議包含大小寫字母、數字和特殊符號
                          </p>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm sm:text-base"
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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">登入記錄</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      最後登入
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                      {new Date(accountInfo.lastSignInAt).toLocaleString(
                        "zh-TW"
                      )}
                    </p>
                  </div>
                  <div className="text-green-600 dark:text-green-400 text-center sm:text-right">
                    <span className="text-xl sm:text-2xl">🟢</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      帳號創建
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                      {new Date(accountInfo.createdAt).toLocaleString("zh-TW")}
                    </p>
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 text-center sm:text-right">
                    <span className="text-xl sm:text-2xl">📅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 安全建議 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">安全建議</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    accountInfo.hasPassword
                      ? "bg-green-50 dark:bg-green-900/20"
                      : "bg-yellow-50 dark:bg-yellow-900/20"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-xl sm:text-2xl">
                      {accountInfo.hasPassword ? "✅" : "⚠️"}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        {accountInfo.hasPassword
                          ? "密碼已設定"
                          : "建議設定密碼"}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                        {accountInfo.hasPassword
                          ? "您的帳號已經有密碼保護，安全性良好。"
                          : "設定密碼可以提升您的帳號安全性，建議盡快設定。"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-xl sm:text-2xl">🔄</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        定期變更密碼
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
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
