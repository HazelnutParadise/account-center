import { getLogtoContext, getAccessTokenRSC } from '@logto/next/server-actions';
import { logtoConfig, getAccountInfo, updateAccountInfo, updateProfileInfo } from '../../logto';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface AccountInfo {
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
    profile?: string;
    website?: string;
    gender?: string;
    birthdate?: string;
    zoneinfo?: string;
    locale?: string;
    address?: {
      streetAddress?: string;
      locality?: string;
      region?: string;
      postalCode?: string;
      country?: string;
    };
  };
  applicationId: string;
  isSuspended: boolean;
  hasPassword: boolean;
  email?: string;
  phone?: string;
}

const updateProfile = async (formData: FormData) => {
  'use server';

  const accessToken = await getAccessTokenRSC(logtoConfig);

  // 基本帳號資訊更新
  const accountData: {
    username?: string;
    name?: string;
    avatar?: string;
  } = {};
  const username = formData.get('username') as string;
  const name = formData.get('name') as string;
  const avatar = formData.get('avatar') as string;

  if (username) accountData.username = username;
  if (name) accountData.name = name;
  if (avatar) accountData.avatar = avatar;

  // 個人資料更新
  const profileData: {
    familyName?: string;
    givenName?: string;
    middleName?: string;
    nickname?: string;
    profile?: string;
    website?: string;
    gender?: string;
    birthdate?: string;
    zoneinfo?: string;
    locale?: string;
    address?: {
      streetAddress?: string;
      locality?: string;
      region?: string;
      postalCode?: string;
      country?: string;
    };
  } = {};
  const familyName = formData.get('familyName') as string;
  const givenName = formData.get('givenName') as string;
  const middleName = formData.get('middleName') as string;
  const nickname = formData.get('nickname') as string;
  const profileUrl = formData.get('profile') as string;
  const website = formData.get('website') as string;
  const gender = formData.get('gender') as string;
  const birthdate = formData.get('birthdate') as string;
  const zoneinfo = formData.get('zoneinfo') as string;
  const locale = formData.get('locale') as string;

  if (familyName) profileData.familyName = familyName;
  if (givenName) profileData.givenName = givenName;
  if (middleName) profileData.middleName = middleName;
  if (nickname) profileData.nickname = nickname;
  if (profileUrl) profileData.profile = profileUrl;
  if (website) profileData.website = website;
  if (gender) profileData.gender = gender;
  if (birthdate) profileData.birthdate = birthdate;
  if (zoneinfo) profileData.zoneinfo = zoneinfo;
  if (locale) profileData.locale = locale;

  // 地址資訊
  const addressData: {
    streetAddress?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  } = {};
  const streetAddress = formData.get('streetAddress') as string;
  const locality = formData.get('locality') as string;
  const region = formData.get('region') as string;
  const postalCode = formData.get('postalCode') as string;
  const country = formData.get('country') as string;

  if (streetAddress || locality || region || postalCode || country) {
    if (streetAddress) addressData.streetAddress = streetAddress;
    if (locality) addressData.locality = locality;
    if (region) addressData.region = region;
    if (postalCode) addressData.postalCode = postalCode;
    if (country) addressData.country = country;
    profileData.address = addressData;
  }

  try {
    // 更新基本帳號資訊
    if (Object.keys(accountData).length > 0) {
      await updateAccountInfo(accessToken, accountData);
    }

    // 更新個人資料
    if (Object.keys(profileData).length > 0) {
      await updateProfileInfo(accessToken, profileData);
    }
  } catch (error) {
    console.error('更新失敗:', error);
    throw new Error('更新個人資料失敗');
  }

  redirect('/dashboard/profile?success=true');
};

const Profile = async({ searchParams }: { searchParams?: Promise<{ success?: string }> }) => {
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

  const params = await searchParams;

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

      {params?.success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <h4 className="text-green-800 dark:text-green-200 font-semibold">
                更新成功
              </h4>
              <p className="text-green-600 dark:text-green-300 text-sm">
                您的個人資料已成功更新
              </p>
            </div>
          </div>
        </div>
      )}

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
        <form action={updateProfile} className="space-y-6">
          {/* 基本資訊編輯 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">
                基本資訊
              </h3>
            </div>
            <div className="p-6">
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
                    <input
                      type="url"
                      name="avatar"
                      defaultValue={accountInfo.avatar}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="頭像URL"
                    />
                  </div>
                </div>

                {/* 姓名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    姓名
                  </label>
                  <input
                    type="text"
                    name="name"
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
                    name="username"
                    defaultValue={accountInfo.username}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="請輸入用戶名"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 個人資料編輯 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">
                個人資料
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 名稱欄位 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    姓氏 (Family Name)
                  </label>
                  <input
                    type="text"
                    name="familyName"
                    defaultValue={accountInfo.profile?.familyName || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="請輸入姓氏"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    名字 (Given Name)
                  </label>
                  <input
                    type="text"
                    name="givenName"
                    defaultValue={accountInfo.profile?.givenName || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="請輸入名字"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    中間名 (Middle Name)
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    defaultValue={accountInfo.profile?.middleName || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="請輸入中間名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    暱稱 (Nickname)
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    defaultValue={accountInfo.profile?.nickname || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="請輸入暱稱"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    個人頁面 URL
                  </label>
                  <input
                    type="url"
                    name="profile"
                    defaultValue={accountInfo.profile?.profile || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com/profile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    個人網站
                  </label>
                  <input
                    type="url"
                    name="website"
                    defaultValue={accountInfo.profile?.website || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    性別
                  </label>
                  <select
                    name="gender"
                    defaultValue={accountInfo.profile?.gender || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">請選擇</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    生日
                  </label>
                  <input
                    type="date"
                    name="birthdate"
                    defaultValue={accountInfo.profile?.birthdate || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    時區
                  </label>
                  <input
                    type="text"
                    name="zoneinfo"
                    defaultValue={accountInfo.profile?.zoneinfo || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Asia/Taipei"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    語言
                  </label>
                  <input
                    type="text"
                    name="locale"
                    defaultValue={accountInfo.profile?.locale || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="zh-TW"
                  />
                </div>
              </div>

              {/* 地址資訊 */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  地址資訊
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      街道地址
                    </label>
                    <input
                      type="text"
                      name="streetAddress"
                      defaultValue={accountInfo.profile?.address?.streetAddress || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="請輸入街道地址"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      城市
                    </label>
                    <input
                      type="text"
                      name="locality"
                      defaultValue={accountInfo.profile?.address?.locality || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="請輸入城市"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      地區/州
                    </label>
                    <input
                      type="text"
                      name="region"
                      defaultValue={accountInfo.profile?.address?.region || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="請輸入地區"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      郵遞區號
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      defaultValue={accountInfo.profile?.address?.postalCode || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="請輸入郵遞區號"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      國家
                    </label>
                    <input
                      type="text"
                      name="country"
                      defaultValue={accountInfo.profile?.address?.country || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="請輸入國家"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 提交按鈕 */}
          <div className="flex justify-end space-x-4">
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
