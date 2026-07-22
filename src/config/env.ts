import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const config = {
  port: Number(getEnv("PORT", "3000")),
  nodeEnv: getEnv("NODE_ENV", "development"),
  secret_key:getEnv("SECRET_KEY", "DNNJLFWBKJNNKLBLJBM"),
  email_secret_Key:getEnv("RESEND_API_KEY", "test"),

  db: {
    name: getEnv("DB", "zamfara_agile"),
    user: getEnv("DB_USER", "postgres"),
    pass: getEnv("DB_PASS", "s1mpl3"),
    host: getEnv("DB_HOST", "localhost"),
    port: Number(getEnv("DB_PORT", "5432"))
  },
};
