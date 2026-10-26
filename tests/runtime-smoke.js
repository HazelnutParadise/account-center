import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Use a local OIDC provider and synthetic credentials. Never contact a real tenant.
const portReservation = Bun.serve({ hostname: '127.0.0.1', port: 0, fetch: () => new Response(null, { status: 503 }) });
const appPort = portReservation.port;
const appUrl = `http://127.0.0.1:${appPort}`;
const clientId = 'runtime-smoke-app';
const cookieJar = new Map();
let challenge;
let tokenRequests = 0;
let accountRequests = 0;
const keys = await crypto.subtle.generateKey({
  name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256',
}, true, ['sign', 'verify']);
const publicKey = { ...await crypto.subtle.exportKey('jwk', keys.publicKey), kid: 'smoke-key', alg: 'RS256', use: 'sig' };
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');

const provider = Bun.serve({
  hostname: '127.0.0.1', port: 0,
  async fetch(request) {
    const url = new URL(request.url);
    const endpoint = url.origin;
    if (url.pathname.endsWith('/.well-known/openid-configuration')) {
      return Response.json({
        issuer: `${endpoint}/oidc`,
        authorization_endpoint: `${endpoint}/oidc/auth`,
        token_endpoint: `${endpoint}/oidc/token`,
        jwks_uri: `${endpoint}/oidc/jwks`,
        userinfo_endpoint: `${endpoint}/oidc/me`,
        end_session_endpoint: `${endpoint}/oidc/session/end`,
        response_types_supported: ['code'], subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
        code_challenge_methods_supported: ['S256'],
      });
    }
    if (url.pathname === '/oidc/jwks') return Response.json({ keys: [publicKey] });
    if (url.pathname === '/oidc/token') {
      const body = new URLSearchParams(await request.text());
      assert.equal(body.get('grant_type'), 'authorization_code');
      assert.equal(body.get('code'), 'synthetic-code');
      assert.equal(body.get('redirect_uri'), `${appUrl}/callback`);
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body.get('code_verifier')));
      assert.equal(Buffer.from(hash).toString('base64url'), challenge);
      tokenRequests++;
      const now = Math.floor(Date.now() / 1000);
      const payload = `${encode({ alg: 'RS256', kid: 'smoke-key' })}.${encode({
        iss: `${endpoint}/oidc`, aud: clientId, sub: 'smoke-user',
        iat: now, exp: now + 3600, name: 'Smoke User', username: 'smoke-user',
      })}`;
      const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, new TextEncoder().encode(payload));
      return Response.json({
        access_token: 'integration-access-token', token_type: 'Bearer', expires_in: 3600,
        scope: 'openid profile email phone custom_data',
        id_token: `${payload}.${Buffer.from(signature).toString('base64url')}`,
      });
    }
    if (url.pathname === '/api/my-account') {
      assert.equal(request.headers.get('authorization'), 'Bearer integration-access-token');
      accountRequests++;
      return Response.json({
        id: 'smoke-user', username: 'smoke-user', name: 'Smoke User', avatar: null,
        createdAt: 1700000000000, lastSignInAt: 1700000000000, profile: {},
        hasPassword: true, primaryEmail: 'smoke@example.invalid',
      });
    }
    return new Response('Unexpected test provider request', { status: 404 });
  },
});

function captureCookies(response) {
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(';')[0];
    const split = pair.indexOf('=');
    cookieJar.set(pair.slice(0, split), pair.slice(split + 1));
  }
}
const cookieHeader = () => [...cookieJar].map(([key, value]) => `${key}=${value}`).join('; ');
const command = await Bun.file('server.js').exists() ? ['bun', '--no-orphans', 'server.js'] : ['bun', '--no-orphans', 'run', 'start'];
portReservation.stop(true);
const app = Bun.spawn(command, {
  env: {
    ...process.env, NODE_ENV: 'production', PORT: String(appPort), HOSTNAME: '127.0.0.1',
    LOGTO_ENDPOINT: `http://127.0.0.1:${provider.port}`,
    LOGTO_APP_ID: clientId, LOGTO_APP_SECRET: 'synthetic-app-secret',
    LOGTO_COOKIE_SECRET: 'synthetic-cookie-secret-at-least-32-characters',
    LOGTO_M2M_CLIENT_ID: 'synthetic-m2m', LOGTO_M2M_CLIENT_SECRET: 'synthetic-m2m-secret',
    BASE_URL_PROD: appUrl, BASE_URL_DEV: appUrl,
  },
  stdout: 'pipe', stderr: 'inherit',
});
let ready = false;
const readStartup = (async () => {
  const decoder = new TextDecoder();
  let output = '';
  for await (const chunk of app.stdout) {
    if (!ready) {
      output = (output + decoder.decode(chunk)).slice(-8192);
      ready = /Ready in \d/.test(output);
    }
  }
})();

try {
  let home;
  for (let i = 0; i < 200; i++) {
    if (app.exitCode !== null) throw new Error(`App exited: ${app.exitCode}`);
    if (!ready) { await Bun.sleep(100); continue; }
    try { home = await fetch(appUrl); break; }
    catch { await Bun.sleep(100); }
  }
  assert.ok(home, 'App did not start');
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.ok(html.includes('歡迎使用帳號中心'));
  const asset = html.match(/(?:src|href)="(\/_next\/static\/[^"?]+\.css)/)?.[1];
  assert.ok(asset, 'Stylesheet missing');
  assert.equal((await fetch(new URL(asset, appUrl))).status, 200);
  for (const path of ['/dashboard', '/dashboard/profile', '/dashboard/security', '/dashboard/settings']) {
    const response = await fetch(new URL(path, appUrl), { redirect: 'manual' });
    assert.equal(response.status, 307, path);
    assert.equal(new URL(response.headers.get('location'), appUrl).pathname, '/');
  }
  console.log('PASS: anonymous home, static stylesheet, and protected routes');

  const manifest = JSON.parse(readFileSync('.next/server/server-reference-manifest.json', 'utf8'));
  const actionIds = Object.entries(manifest.node).filter(([, action]) => Object.hasOwn(action.workers, 'app/page')).map(([id]) => id);
  assert.equal(actionIds.length, 1, 'Expected one home sign-in action');
  const signIn = await fetch(appUrl, {
    method: 'POST', redirect: 'manual', body: '[]',
    headers: { 'Next-Action': actionIds[0], 'Content-Type': 'text/plain;charset=UTF-8', Accept: 'text/x-component', Origin: appUrl },
  });
  const redirect = signIn.headers.get('x-action-redirect');
  assert.ok(redirect, `Sign-in failed: HTTP ${signIn.status}`);
  const authorization = new URL(redirect.split(';')[0]);
  assert.equal(authorization.origin, `http://127.0.0.1:${provider.port}`);
  assert.equal(authorization.searchParams.get('client_id'), clientId);
  assert.equal(authorization.searchParams.get('redirect_uri'), `${appUrl}/callback`);
  challenge = authorization.searchParams.get('code_challenge');
  assert.ok(challenge);
  assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256');
  captureCookies(signIn);
  assert.ok(cookieJar.size > 0, 'Sign-in session cookie missing');

  const callback = new URL('/callback', appUrl);
  callback.searchParams.set('code', 'synthetic-code');
  callback.searchParams.set('state', authorization.searchParams.get('state'));
  const completed = await fetch(callback, { redirect: 'manual', headers: { Cookie: cookieHeader() } });
  assert.equal(completed.status, 307, 'Callback must redirect after verifying the token');
  assert.equal(new URL(completed.headers.get('location'), appUrl).pathname, '/');
  assert.equal(tokenRequests, 1);
  captureCookies(completed);
  const authenticatedHome = await fetch(appUrl, { redirect: 'manual', headers: { Cookie: cookieHeader() } });
  assert.equal(authenticatedHome.status, 307);
  assert.equal(new URL(authenticatedHome.headers.get('location'), appUrl).pathname, '/dashboard');
  const dashboard = await fetch(new URL('/dashboard', appUrl), { headers: { Cookie: cookieHeader() } });
  assert.equal(dashboard.status, 200);
  const dashboardHtml = await dashboard.text();
  assert.ok(dashboardHtml.includes('Smoke User'));
  assert.ok(accountRequests > 0, 'Authenticated account API was not called');
  console.log('PASS: sign-in server action, PKCE callback, signed ID token, session cookie, and authenticated dashboard');
} finally {
  app.kill();
  await app.exited;
  try { await readStartup; } finally { provider.stop(true); }
}
