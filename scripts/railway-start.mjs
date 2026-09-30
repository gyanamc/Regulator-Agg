import { spawnSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// 1. Ensure DATABASE_URL is set; default to SQLite file if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
  console.log('[Railway Boot] DATABASE_URL was not set, defaulting to file:./dev.db');
}

const dbUrl = process.env.DATABASE_URL;
const schemaPath = path.resolve('prisma/schema.prisma');

// 2. Adjust schema provider if user supplied a PostgreSQL database URL
if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  console.log('[Railway Boot] Detected PostgreSQL connection string. Ensuring provider is postgresql...');
  let schema = fs.readFileSync(schemaPath, 'utf8');
  if (schema.includes('provider = "sqlite"')) {
    schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema, 'utf8');
    console.log('[Railway Boot] Updated prisma/schema.prisma provider to postgresql');
  }
} else {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  if (schema.includes('provider = "postgresql"')) {
    schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
    fs.writeFileSync(schemaPath, schema, 'utf8');
    console.log('[Railway Boot] Updated prisma/schema.prisma provider to sqlite');
  }
}

// 3. Run Prisma db push to ensure database schema and tables exist
console.log('[Railway Boot] Synchronizing database schema via prisma db push...');
const pushResult = spawnSync('npx', ['prisma', 'db', 'push', '--accept-data-loss'], {
  stdio: 'inherit',
  env: process.env,
});

if (pushResult.status !== 0) {
  console.error('[Railway Boot] Warning: prisma db push failed. Will attempt to continue...');
}

// 4. Run database seed script
console.log('[Railway Boot] Seeding initial regulatory data...');
const seedResult = spawnSync('node', ['scripts/seed.mjs'], {
  stdio: 'inherit',
  env: process.env,
});

if (seedResult.status !== 0) {
  console.error('[Railway Boot] Warning: seeding failed. Continuing to web server boot...');
}

// 5. Ensure Next.js production build exists; run build if missing
if (!fs.existsSync(path.resolve('.next/BUILD_ID'))) {
  console.log('[Railway Boot] No production build found in .next directory. Running next build now...');
  const buildResult = spawnSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    env: process.env,
  });
  if (buildResult.status !== 0) {
    console.error('[Railway Boot] Warning: next build exited with non-zero code. Attempting to start server...');
  }
}

// 6. Start Next.js bound to 0.0.0.0 and dynamic Railway PORT
const port = process.env.PORT || '3000';
console.log(`[Railway Boot] Starting Next.js server on 0.0.0.0:${port}...`);

const nextStart = spawn('npx', ['next', 'start', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  env: process.env,
});

nextStart.on('close', (code) => {
  process.exit(code || 0);
});
