import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

// Load .env before the config is evaluated so DATABASE_URL is available
// to the Prisma CLI (migrate, studio). The runtime connection goes through
// @prisma/adapter-pg which reads DATABASE_URL from process.env directly.
config();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
