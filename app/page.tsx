import { getLogtoContext, signIn, signOut,getAccessToken } from '@logto/next/server-actions';
import SignIn from './sign-in';
import SignOut from './sign-out';
import { logtoConfig,getAccountInfo } from './logto';

const Home = async() => {
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);
  let accountInfo: any = null;
  if (isAuthenticated) {
    const accessToken = await getAccessToken(logtoConfig);
    try {
      accountInfo = await getAccountInfo(accessToken);
    } catch (e) {
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
            <pre>{JSON.stringify(accountInfo, null, 2)}</pre>
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