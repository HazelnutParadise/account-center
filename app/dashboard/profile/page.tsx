import { getLogtoContext, getAccountInfo, updateAccountInfo, updateProfileInfo, AccountInfo, getSocialIdentities } from '../../logto';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import Avatar from '../components/Avatar';

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
    avatar?: string | null;
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
    // 如果用戶清空頭像連結，傳送 null；否則傳送修剪後的值
    accountData.avatar = avatarValue.trim() === '' ? null : avatarValue.trim();
  }

  // 個人資料更新 - 只發送有變化的欄位
  const profileData: {
    familyName?: string;
    givenName?: string;
    middleName?: string;
    nickname?: string;
    preferredUsername?: string;
    profile?: string;
    website?: string;
    gender?: string;
    birthdate?: string;
    zoneinfo?: string;
    locale?: string;
  } = {};

  // 取得表單資料
  const familyName = formData.get('familyName') as string;
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
    
    // 解析錯誤訊息
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 檢查是否是用戶名已被使用的錯誤
    if (errorMessage.includes('user.username_already_in_use') || 
        errorMessage.includes('This username is already in use')) {
      redirect('/dashboard/profile?error=username_already_in_use');
      return;
    }
    
    // 其他錯誤
    redirect('/dashboard/profile?error=update_failed');
    return;
  }

  redirect('/dashboard/profile?success=true');
};

const Profile = async({ searchParams }: { searchParams?: Promise<{ success?: string; error?: string; edit?: string }> }) => {
  const { isAuthenticated } = await getLogtoContext();
  let accountInfo: AccountInfo | { error: string } | null = null;
  let socialIdentities: Record<string, unknown> | null = null;

  if (isAuthenticated) {
    try {
      accountInfo = await getAccountInfo();
    } catch {
      accountInfo = { error: '取得帳號資訊失敗' };
    }

    // 獲取社群身分
    try {
      socialIdentities = await getSocialIdentities();
    } catch (error) {
      console.error('Failed to get social identities:', error);
      socialIdentities = { socialIdentities: [], ssoIdentities: [] };
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
                {params.error === 'username_already_in_use' && '用戶名已被使用'}
                {params.error === 'update_failed' && '更新失敗'}
              </h4>
              <p className="text-red-600 dark:text-red-300 text-sm">
                {params.error === 'username_required' && '請提供有效的用戶名'}
                {params.error === 'username_already_in_use' && '此用戶名已被其他用戶使用，請選擇其他用戶名'}
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
                      <Avatar
                        src={accountInfo.avatar}
                        alt="Avatar"
                        name={accountInfo.name || accountInfo.username}
                        size={120}
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
                          {accountInfo.primaryEmail || '未設定'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          電話號碼
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {accountInfo.primaryPhone || '未設定'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 社群帳號卡片 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white">社群帳號</h3>
                </div>
                <div className="p-6">
                  {socialIdentities && 
                   (Array.isArray((socialIdentities as { socialIdentities?: unknown[] }).socialIdentities) && 
                    (socialIdentities as { socialIdentities?: unknown[] }).socialIdentities!.length > 0) || 
                   (Array.isArray((socialIdentities as { ssoIdentities?: unknown[] }).ssoIdentities) && 
                    (socialIdentities as { ssoIdentities?: unknown[] }).ssoIdentities!.length > 0) ? (
                    <div className="space-y-4">
                      {/* 社群登入身分 */}
                      {Array.isArray((socialIdentities as { socialIdentities?: unknown[] }).socialIdentities) &&
                       (socialIdentities as { socialIdentities?: unknown[] }).socialIdentities!.map((identity: unknown, index: number) => {
                        const socialId = identity as { 
                          target: string; 
                          identity: { 
                            userId: string;
                            details?: {
                              id: string;
                              name: string;
                              email: string;
                              avatar: string;
                              rawData: {
                                sub: string;
                                name: string;
                                email: string;
                                picture: string;
                                given_name: string;
                                family_name: string;
                                email_verified: boolean;
                              };
                            }
                          } 
                        };

                        const getProviderIcon = (provider: string) => {
                          switch (provider.toLowerCase()) {
                            case 'google':
                              return (
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                  </svg>
                                </div>
                              );
                            case 'github':
                              return (
                                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                  </svg>
                                </div>
                              );
                            default:
                              return (
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                    {provider.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              );
                          }
                        };

                        return (
                          <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-start space-x-4">
                              {getProviderIcon(socialId.target)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                                    {socialId.target}
                                  </h4>
                                  <div className="flex items-center text-green-500">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium">已連結</span>
                                  </div>
                                </div>
                                
                                {socialId.identity.details && (
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-3">
                                      {socialId.identity.details.avatar && (
                                        <Image 
                                          src={socialId.identity.details.avatar} 
                                          alt="Avatar"
                                          width={32}
                                          height={32}
                                          className="w-8 h-8 rounded-full"
                                        />
                                      )}
                                      <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {socialId.identity.details.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                          {socialId.identity.details.email}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">用戶 ID</span>
                                        <p className="text-sm text-gray-900 dark:text-white font-mono">
                                          {socialId.identity.details.id}
                                        </p>
                                      </div>
                                      

                                      
                                      {socialId.identity.details.rawData?.given_name && (
                                        <div>
                                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">名字</span>
                                          <p className="text-sm text-gray-900 dark:text-white">
                                            {socialId.identity.details.rawData.given_name}
                                          </p>
                                        </div>
                                      )}
                                      
                                      {socialId.identity.details.rawData?.family_name && (
                                        <div>
                                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">姓氏</span>
                                          <p className="text-sm text-gray-900 dark:text-white">
                                            {socialId.identity.details.rawData.family_name}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* SSO 身分 */}
                      {Array.isArray((socialIdentities as { ssoIdentities?: unknown[] }).ssoIdentities) &&
                       (socialIdentities as { ssoIdentities?: unknown[] }).ssoIdentities!.map((identity: unknown, index: number) => {
                        const ssoId = identity as { ssoConnectorId: string; ssoIdentity: { detail: Record<string, unknown> } };
                        return (
                          <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                  <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">
                                    SSO
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {ssoId.ssoConnectorId}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    企業登入
                                  </p>
                                </div>
                              </div>
                              <div className="text-green-500">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        沒有連結的社群帳號
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400">
                        您還沒有連結任何社群帳號
                      </p>
                    </div>
                  )}
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
                        <Avatar
                          src={accountInfo.avatar}
                          alt="Avatar"
                          name={accountInfo.name || accountInfo.username}
                          size={100}
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

                    {/* 名字 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        名字
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={accountInfo.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="請輸入您的名字"
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          params?.error === 'username_already_in_use' 
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                        }`}
                        placeholder="請輸入用戶名"
                      />
                      {params?.error === 'username_already_in_use' && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          此用戶名已被使用，請選擇其他用戶名
                        </p>
                      )}
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
