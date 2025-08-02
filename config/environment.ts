import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3500"),
  MONGO_URI: z.string().min(1, "MongoDB URI is required"),
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(32, "Access token secret must be at least 32 characters"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, "Refresh token secret must be at least 32 characters"),
  RECAPTCHA_SECRET_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  HF_API_KEY: z.string().optional(),
  MJ_APIKEY_PUBLIC: z.string().optional(),
  MJ_APIKEY_PRIVATE: z.string().optional(),
  HTTPS: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).default("100"),
  UPLOAD_MAX_SIZE: z.string().transform(Number).default("5242880"), // 5MB
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

// Validate environment variables
const envParseResult = envSchema.safeParse(process.env);

if (!envParseResult.success) {
  console.error("❌ Invalid environment variables:");
  console.error(envParseResult.error.format());
  process.exit(1);
}

// Export validated environment variables
export const env = envParseResult.data;

// Environment-specific configurations
export const config = {
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  server: {
    port: env.PORT,
    host: "0.0.0.0",
  },
  database: {
    uri: env.MONGO_URI,
  },
  jwt: {
    accessTokenSecret: env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
    accessTokenExpiry: "15m",
    refreshTokenExpiry: "7d",
  },
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },
  upload: {
    maxSize: env.UPLOAD_MAX_SIZE,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  },
  logging: {
    level: env.LOG_LEVEL,
  },
  external: {
    recaptcha: env.RECAPTCHA_SECRET_KEY,
    google: env.GOOGLE_CLIENT_ID,
    huggingface: env.HF_API_KEY,
    mailjet: {
      public: env.MJ_APIKEY_PUBLIC,
      private: env.MJ_APIKEY_PRIVATE,
    },
  },
} as const;

export default config;
