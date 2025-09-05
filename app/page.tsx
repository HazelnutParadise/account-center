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
    <nav>
      {isAuthenticated ? (
        <div>
          <p>
            Hello, {claims?.sub},
            <SignOut
              onSignOut={async () => {
                'use server';
                await signOut(logtoConfig);
              }}
            />
          </p>
          <div>
            <h2>帳號資訊</h2>
            {accountInfo && 'error' in accountInfo ? (
              <pre>{JSON.stringify(accountInfo, null, 2)}</pre>
            ) : accountInfo ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {accountInfo.id}</p>
                <p><strong>用戶名:</strong> {accountInfo.username}</p>
                <p><strong>姓名:</strong> {accountInfo.name}</p>
                <p><strong>頭像:</strong> <Image src={accountInfo.avatar} alt="Avatar" width={64} height={64} className="rounded-full" /></p>
                <p><strong>最後登入:</strong> {new Date(accountInfo.lastSignInAt).toLocaleString()}</p>
                <p><strong>創建時間:</strong> {new Date(accountInfo.createdAt).toLocaleString()}</p>
                <p><strong>更新時間:</strong> {new Date(accountInfo.updatedAt).toLocaleString()}</p>
                <p><strong>應用程式 ID:</strong> {accountInfo.applicationId}</p>
                <p><strong>是否停權:</strong> {accountInfo.isSuspended ? '是' : '否'}</p>
                <p><strong>有密碼:</strong> {accountInfo.hasPassword ? '是' : '否'}</p>
                {accountInfo.email && <p><strong>電子郵件:</strong> {accountInfo.email}</p>}
                {accountInfo.phone && <p><strong>電話:</strong> {accountInfo.phone}</p>}
                {accountInfo.profile && Object.keys(accountInfo.profile).length > 0 && (
                  <div>
                    <strong>個人資料:</strong>
                    <pre>{JSON.stringify(accountInfo.profile, null, 2)}</pre>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <p>
          <SignIn
            onSignIn={async () => {
              'use server';
              await signIn(logtoConfig);
            }}
          />
        </p>
      )}
    </nav>
  );
};

export default Home;