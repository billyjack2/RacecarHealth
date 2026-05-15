import { defineConfig } from "drizzle-kit";

const url = process.env.POSTGRES_URL_NON_POOLING;
if (!url) {
  throw new Error(
    "POSTGRES_URL_NON_POOLING is required for drizzle-kit. " +
      "Copy packages/db/.env.example to packages/db/.env and fill it in.",
  );
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
