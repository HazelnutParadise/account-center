import { getLogtoContext, getAccountInfo, updateAccountInfo, updateProfileInfo, AccountInfo } from '../../logto';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const updateProfile = async (formData: FormData) => {
  'use server';

  // 先獲取當前帳號資訊來比較
  let currentAccountInfo;
  try {
    currentAccountInfo = await getAccountInfo();
  } catch (error) {
    console.error('無法獲取當前帳號資訊:', error);
    redirect('/dashboard/profile?error=update_failed');
    return;
  }

  // 基本帳號資訊更新 - 允許空值（除了username必須有值）
  const accountData: {
    username?: string;
    name?: string;
    avatar?: string;
  } = {};
  
  const username = formData.get('username') as string;
  const nameValue = formData.get('name') as string;
  const avatarValue = formData.get('avatar') as string;

  // username 必須有值
  if (username && username.trim()) {
    accountData.username = username.trim();
  } else {
    redirect('/dashboard/profile?error=username_required');
    return;
  }
  
  // name 和 avatar 只在有變化時更新
  if (nameValue !== null && nameValue !== (currentAccountInfo.name || '')) {
    accountData.name = nameValue.trim();
  }
  if (avatarValue !== null && avatarValue !== (currentAccountInfo.avatar || '')) {
    accountData.avatar = avatarValue.trim();
  }

  // 個人資料更新 - 只發送有變化的欄位
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

  // 取得表單資料
  const familyName = formData.get('familyName') as string;
  const givenName = formData.get('givenName') as string;
  const middleName = formData.get('middleName') as string;
  const nickname = formData.get('nickname') as string;
  const profile = formData.get('profile') as string;
  const website = formData.get('website') as string;
  const gender = formData.get('gender') as string;
  const birthdate = formData.get('birthdate') as string;
  const zoneinfo = formData.get('zoneinfo') as string;
  const locale = formData.get('locale') as string;

  // 只有在欄位有值時才更新（包括空字串用於清空）
  // 比較表單值與當前值，只有不同時才更新
  const currentProfile = currentAccountInfo.profile || {};
  
  if (familyName !== null && familyName !== (currentProfile.familyName || '')) {
    profileData.familyName = familyName.trim();
  }
  if (givenName !== null && givenName !== (currentProfile.givenName || '')) {
    profileData.givenName = givenName.trim();
  }
  if (middleName !== null && middleName !== (currentProfile.middleName || '')) {
    profileData.middleName = middleName.trim();
  }
  if (nickname !== null && nickname !== (currentProfile.nickname || '')) {
    profileData.nickname = nickname.trim();
  }
  if (profile !== null && profile !== (currentProfile.profile || '')) {
    profileData.profile = profile.trim();
  }
  if (website !== null && website !== (currentProfile.website || '')) {
    profileData.website = website.trim();
  }
  if (gender !== null && gender !== (currentProfile.gender || '')) {
    profileData.gender = gender.trim();
  }
  if (birthdate !== null && birthdate !== (currentProfile.birthdate || '')) {
    profileData.birthdate = birthdate.trim();
  }
  if (zoneinfo !== null && zoneinfo !== (currentProfile.zoneinfo || '')) {
    profileData.zoneinfo = zoneinfo.trim();
  }
  if (locale !== null && locale !== (currentProfile.locale || '')) {
    profileData.locale = locale.trim();
  }

  // 地址資訊 - 只更新有變化的欄位
  const streetAddress = formData.get('streetAddress') as string;
  const locality = formData.get('locality') as string;
  const region = formData.get('region') as string;
  const postalCode = formData.get('postalCode') as string;
  const country = formData.get('country') as string;

  const currentAddress = currentProfile.address || {};
  const addressData: {
    streetAddress?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  } = {};

  let hasAddressChanges = false;

  if (streetAddress !== null && streetAddress !== (currentAddress.streetAddress || '')) {
    addressData.streetAddress = streetAddress.trim();
    hasAddressChanges = true;
  }
  if (locality !== null && locality !== (currentAddress.locality || '')) {
    addressData.locality = locality.trim();
    hasAddressChanges = true;
  }
  if (region !== null && region !== (currentAddress.region || '')) {
    addressData.region = region.trim();
    hasAddressChanges = true;
  }
  if (postalCode !== null && postalCode !== (currentAddress.postalCode || '')) {
    addressData.postalCode = postalCode.trim();
    hasAddressChanges = true;
  }
  if (country !== null && country !== (currentAddress.country || '')) {
    addressData.country = country.trim();
    hasAddressChanges = true;
  }

  if (hasAddressChanges) {
    profileData.address = addressData;
  }

  try {
    // 只有當帳號資料有變化時才更新
    if (Object.keys(accountData).length > 0) {
      await updateAccountInfo(accountData);
    }

    // 只有當個人資料有變化時才更新
    if (Object.keys(profileData).length > 0) {
      await updateProfileInfo(profileData);
    }
  } catch (error) {
    console.error('更新失敗:', error);
    redirect('/dashboard/profile?error=update_failed');
    return;
  }

  redirect('/dashboard/profile?success=true');
};

const Profile = async({ searchParams }: { searchParams?: Promise<{ success?: string; error?: string; edit?: string }> }) => {
  const { isAuthenticated } = await getLogtoContext();
  let accountInfo: AccountInfo | { error: string } | null = null;

  if (isAuthenticated) {
    try {
      accountInfo = await getAccountInfo();
    } catch {
      accountInfo = { error: '取得帳號資訊失敗' };
    }
  }

  const params = await searchParams;
  const isEditMode = params?.edit === 'true';

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            個人資料
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isEditMode ? '編輯您的帳號資訊和個人設定' : '檢視您的帳號資訊和個人設定'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            ← 返回總覽
          </Link>
          {!isEditMode ? (
            <Link
              href="/dashboard/profile?edit=true"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              編輯資料
            </Link>
          ) : (
            <Link
              href="/dashboard/profile"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              取消編輯
            </Link>
          )}
        </div>
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

      {params?.error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">❌</span>
            <div>
              <h4 className="text-red-800 dark:text-red-200 font-semibold">
                {params.error === 'username_required' && '用戶名不能為空'}
                {params.error === 'update_failed' && '更新失敗'}
              </h4>
              <p className="text-red-600 dark:text-red-300 text-sm">
                {params.error === 'username_required' && '請提供有效的用戶名'}
                {params.error === 'update_failed' && '更新個人資料時發生錯誤，請稍後再試'}
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
        <>
          {/* 顯示模式 */}
          {!isEditMode ? (
            <div className="space-y-6">
              {/* 基本資訊卡片 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white">基本資訊</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="flex-shrink-0">
                      <Image
                        src={accountInfo.avatar || '/placeholder-avatar.png'}
                        alt="Avatar"
                        width={120}
                        height={120}
                        className="rounded-full border-4 border-gray-200 dark:border-gray-600"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                        {accountInfo.name || '未設定'}
                      </h4>
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                        @{accountInfo.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        用戶 ID: {accountInfo.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 個人資料卡片 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white">個人資料</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          姓氏
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.profile?.familyName || '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          名字
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.profile?.givenName || '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          暱稱
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.profile?.nickname || '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          性別
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.profile?.gender === 'male' ? '男性' :
                           accountInfo.profile?.gender === 'female' ? '女性' :
                           accountInfo.profile?.gender === 'other' ? '其他' : '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          生日
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.profile?.birthdate || '未設定'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          個人網站
                        </label>
                        <p className="text-gray-900 dark:text-white break-all">
                          {accountInfo.profile?.website ? (
                            <a 
                              href={accountInfo.profile.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 underline"
                            >
                              {accountInfo.profile.website}
                            </a>
                          ) : '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          時區
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.profile?.zoneinfo || '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          語言
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.profile?.locale || '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          電子郵件
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.email || '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          電話號碼
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.phone || '未設定'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 地址資訊 */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      地址資訊
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          街道地址
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.profile?.address?.streetAddress || '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          城市
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.profile?.address?.locality || '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          地區/州
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.profile?.address?.region || '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          郵遞區號
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.profile?.address?.postalCode || '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          國家
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.profile?.address?.country || '未設定'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 編輯模式 */
            <form action={updateProfile} className="space-y-6">
              {/* 基本資訊編輯 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white">基本資訊</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 頭像區域 */}
                    <div className="md:col-span-2 flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <Image
                          src={accountInfo.avatar || '/placeholder-avatar.png'}
                          alt="Avatar"
                          width={100}
                          height={100}
                          className="rounded-full border-4 border-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          頭像 URL
                        </h4>
                        <input
                          type="url"
                          name="avatar"
                          defaultValue={accountInfo.avatar || ''}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="https://example.com/avatar.jpg"
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
                        defaultValue={accountInfo.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="請輸入您的姓名"
                      />
                    </div>

                    {/* 用戶名 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        用戶名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        defaultValue={accountInfo.username}
                        required
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
                  <h3 className="text-xl font-semibold text-white">個人資料</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 姓氏 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        姓氏
                      </label>
                      <input
                        type="text"
                        name="familyName"
                        defaultValue={accountInfo.profile?.familyName || ''}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="請輸入姓氏"
                      />
                    </div>

                    {/* 名字 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        名字
                      </label>
                      <input
                        type="text"
                        name="givenName"
                        defaultValue={accountInfo.profile?.givenName || ''}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="請輸入名字"
                      />
                    </div>

                    {/* 中間名 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        中間名
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        defaultValue={accountInfo.profile?.middleName || ''}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="請輸入中間名"
                      />
                    </div>

                    {/* 暱稱 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        暱稱
                      </label>
                      <input
                        type="text"
                        name="nickname"
                        defaultValue={accountInfo.profile?.nickname || ''}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="請輸入暱稱"
                      />
                    </div>

                    {/* 個人頁面 */}
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

                    {/* 個人網站 */}
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

                    {/* 性別 */}
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

                    {/* 生日 */}
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

                    {/* 時區 */}
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

                    {/* 語言 */}
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
                  href="/dashboard/profile"
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
          )}
        </>
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
