/**
 * Applies Prisma migrations to the database in `.env.test` (default: courier_test).
 * Run once after `docker compose up -d` before integration tests.
 */
import { execSync } from 'child_process';
import path from 'path';
import { config } from 'dotenv';

config({ path: path.join(__dirname, '..', '.env.test') }); 

execSync('npx prisma migrate deploy', {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  env: process.env,
});
