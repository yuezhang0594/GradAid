import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DIRECT_URL!,
  },
  introspect: {
    casing: "preserve",
  },
  entities: {
    roles: {
      provider: 'supabase'
    }
  }
});
