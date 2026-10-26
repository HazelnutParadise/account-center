import { afterEach, beforeEach, expect, mock, spyOn, test } from 'bun:test';

process.env.LOGTO_ENDPOINT = 'https://logto.example.invalid';
process.env.LOGTO_APP_ID = 'test-app';
process.env.LOGTO_APP_SECRET = 'test-app-secret';
process.env.LOGTO_COOKIE_SECRET = 'test-cookie-secret-with-at-least-32-characters';
process.env.LOGTO_M2M_CLIENT_ID = 'test-m2m';
process.env.LOGTO_M2M_CLIENT_SECRET = 'test-m2m-secret';

let token;
let claims;
const getContext = mock(async () => ({ claims }));
const getAccessToken = mock(async () => ({ value: token }));
mock.module('@logto/next/server-actions', () => ({
  getLogtoContext: getContext,
  signIn: mock(),
  signOut: mock(),
  getAccessTokenRSC: mock(),
  handleSignIn: mock(),
}));
mock.module('@logto/api/management', () => ({
  createManagementApi: () => ({
    apiClient: { GET: async () => ({ data: { enabled: false } }) },
    clientCredentials: { getAccessToken },
  }),
}));

const { managementAPI } = await import('../app/logto.ts');
const originalFetch = globalThis.fetch;
let fetchMock;
let logs;

beforeEach(() => {
  token = 'test-management-token';
  claims = { sub: 'test-user' };
  fetchMock = mock(async () => Response.json({ success: true }));
  globalThis.fetch = fetchMock;
  logs = ['log', 'info', 'warn', 'error', 'debug'].map(method =>
    spyOn(console, method).mockImplementation(() => {})
  );
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const log of logs) log.mockRestore();
});

function expectNoTokenInLogs() {
  for (const log of logs) {
    const values = [];
    function collect(value) {
      if (typeof value === 'string') values.push(value);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    }
    collect(log.mock.calls);
    expect(values.join('\n')).not.toContain(token);
  }
}

for (const secret of ['test-management-token', 'token-with-\"quotes\"-秘密']) {
  test('setting a password preserves the authorized request without logging ' + secret, async () => {
    token = secret;
    expect(await managementAPI.setPassword('new-password')).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://logto.example.invalid/api/users/test-user/password',
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: 'new-password' }),
      }
    );
    expectNoTokenInLogs();
  });
}

test('API errors retain their status and body without logging the token', async () => {
  fetchMock.mockImplementation(async () => new Response('invalid password', { status: 400 }));
  await expect(managementAPI.setPassword('new-password')).rejects.toThrow('400: invalid password');
  expectNoTokenInLogs();
});

test('unreadable API errors retain the existing fallback', async () => {
  fetchMock.mockImplementation(async () => ({
    ok: false,
    status: 502,
    text: async () => { throw new Error('read failed'); },
  }));
  await expect(managementAPI.setPassword('new-password')).rejects.toThrow('502: Unknown error');
  expectNoTokenInLogs();
});

test('missing identity still prevents the password request', async () => {
  claims = undefined;
  await expect(managementAPI.setPassword('new-password')).rejects.toThrow('User ID is missing in token claims');
  expect(fetchMock).not.toHaveBeenCalled();
  expectNoTokenInLogs();
});

test('the setup script keeps its request without logging the token object', async () => {
  await import('../.js');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, request] = fetchMock.mock.calls[0];
  expect(url).toBe('https://logto.example.invalid/api/account-center');
  expect(request.method).toBe('PATCH');
  expect(request.headers.Authorization).toBe(`Bearer ${token}`);
  expect(JSON.parse(request.body).enabled).toBe(true);
  expectNoTokenInLogs();
});
