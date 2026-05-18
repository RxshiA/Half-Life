import fs from 'fs';
import path from 'path';

// Load .env.test before anything else evaluates environment-dependent modules.
const envTestPath = path.resolve(__dirname, '../.env.test');
if (fs.existsSync(envTestPath)) {
  const content = fs.readFileSync(envTestPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Hard-coded test defaults (safe fallbacks when .env.test is missing).
process.env['NODE_ENV'] ??= 'test';
process.env['JWT_SECRET'] ??= 'test-secret-key-that-is-at-least-32-chars-long';
process.env['JWT_EXPIRES_IN'] ??= '7d';
process.env['PORT'] ??= '4001';
process.env['CORS_ORIGIN'] ??= 'http://localhost:5173';
process.env['DATABASE_URL'] ??=
  'postgresql://postgres:postgres@localhost:5432/courier_test';

afterEach(() => {
  jest.clearAllMocks();
});
