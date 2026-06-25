import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

// Load .env before the config is evaluated so DATABASE_URL is available
// to the Prisma CLI (migrate, studio). The runtime connection goes through
// @prisma/adapter-pg which reads DATABASE_URL from process.env directly.
config();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Fallback keeps `prisma generate` (postinstall) working on a fresh clone
    // before .env exists. generate never opens a DB connection so the value
    // doesn't matter — only migrate/studio need the real URL.
    url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/crm_dev',
  },
});
