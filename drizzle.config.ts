import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    // Include both our custom tables and Better Auth's generated tables
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        // Use the unpooled direct connection URL for migrations
        url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
    },
});
