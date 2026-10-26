import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const compose = readFileSync('docker-compose.yml', 'utf8');
const required = {
  LOGTO_ENDPOINT: 'https://logto.example.invalid',
  LOGTO_APP_ID: 'test-app',
  LOGTO_APP_SECRET: 'synthetic-app-secret',
  LOGTO_COOKIE_SECRET: 'synthetic-cookie-secret-at-least-32-characters',
  LOGTO_M2M_CLIENT_ID: 'test-m2m',
  LOGTO_M2M_CLIENT_SECRET: 'synthetic-m2m-secret',
  BASE_URL_PROD: 'https://account.example.invalid',
};
const optional = ['LOGTO_GITHUB_CONNECTOR_ID', 'LOGTO_GOOGLE_CONNECTOR_ID'];
const env = { ...process.env };
for (const key of [...Object.keys(required), ...optional, 'NODE_ENV', 'BASE_URL_DEV', 'COMPOSE_ENV_FILES', 'COMPOSE_DISABLE_ENV_FILE']) delete env[key];
const directory = mkdtempSync(join(tmpdir(), 'account-center-compose-'));
const fixtures = new Map();
function fixture(name, content) {
  const path = join(directory, name);
  writeFileSync(path, content, { flag: 'wx' });
  fixtures.set(path, content);
  return path;
}
function settings(values) {
  return Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n';
}
function resolve(file, overrides = {}) {
  const command = ['docker', 'compose', '-f', join(directory, 'docker-compose.yml')];
  if (file) command.push('--env-file', file);
  command.push('config', '--format', 'json');
  const result = Bun.spawnSync(command, { cwd: directory, env: { ...env, ...overrides }, stdout: 'pipe', stderr: 'pipe' });
  const decoder = new TextDecoder();
  return { code: result.exitCode, output: decoder.decode(result.stdout), error: decoder.decode(result.stderr) };
}

try {
  fixture('docker-compose.yml', compose);
  fixture('.env', settings({ ...required, NODE_ENV: 'development', BASE_URL_DEV: 'http://localhost:3000', UNLISTED_SECRET: 'must-not-enter-container' }));
  const valid = resolve();
  assert.equal(valid.code, 0, valid.error);
  const environment = JSON.parse(valid.output).services.app.environment;
  assert.deepEqual(environment, { ...required, NODE_ENV: 'production', LOGTO_GITHUB_CONNECTOR_ID: '', LOGTO_GOOGLE_CONNECTOR_ID: '' });
  assert.doesNotMatch(compose, /^\s*env_file\s*:/m);
  console.log('PASS: default .env substitution, explicit variables only, fixed production mode, optional defaults');

  for (const key of Object.keys(required)) {
    for (const mode of ['missing', 'empty']) {
      const values = { ...required };
      if (mode === 'missing') delete values[key];
      else values[key] = '';
      const file = fixture(`${key}-${mode}.env`, settings(values));
      const result = resolve(file);
      assert.notEqual(result.code, 0, `${key} ${mode} was accepted`);
      assert.ok(result.error.includes(key), `${key} was not identified in the failure`);
    }
  }
  console.log('PASS: all 7 required variables reject both missing and empty values (14 cases)');

  const file = fixture('social.env', settings({ ...required, LOGTO_GITHUB_CONNECTOR_ID: 'github-test', LOGTO_GOOGLE_CONNECTOR_ID: 'google-test' }));
  const social = resolve(file);
  assert.equal(social.code, 0, social.error);
  const socialEnvironment = JSON.parse(social.output).services.app.environment;
  assert.equal(socialEnvironment.LOGTO_GITHUB_CONNECTOR_ID, 'github-test');
  assert.equal(socialEnvironment.LOGTO_GOOGLE_CONNECTOR_ID, 'google-test');
  const overridden = resolve(undefined, { LOGTO_APP_ID: 'shell-app' });
  assert.equal(overridden.code, 0, overridden.error);
  assert.equal(JSON.parse(overridden.output).services.app.environment.LOGTO_APP_ID, 'shell-app');
  console.log('PASS: optional social settings and shell precedence');
} finally {
  for (const [path, content] of fixtures) {
    assert.equal(readFileSync(path, 'utf8'), content, `Fixture changed: ${path}`);
    unlinkSync(path);
  }
  rmdirSync(directory);
}
