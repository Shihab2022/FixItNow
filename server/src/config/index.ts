import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  timezone: process.env.TIMEZONE || "Asia/Dhaka",
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  reset_access_secret: process.env.RESET_PASS_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expire_in: process.env.JWT_ACCESS_EXPIRES_IN,
  reset_pass_access_expire_in: process.env.RESET_PASS_ACCESS_EXPIRES_IN,
  jwt_refresh_expire_in: process.env.JWT_REFRESH_EXPIRES_IN,
  reset_pass_base_link: process.env.RESET_PASS_BASE_LINK,
  // Strip a trailing slash (if any) so email CTA buttons build valid URLs.
  // Falls back to http://localhost:3000 when the env var is missing so email
  // buttons never render as "undefined/booking/..." (which led to 404 pages).
  front_end_base_url: (process.env.FRONT_END_BASE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    url: process.env.REDIS_URL,
  },
  ssl: {
    store_id: process.env.STORE_ID,
    store_passwd: process.env.STORE_PASS,
    sslPaymentApi: process.env.SSL_PAYMENT_API,
    success_url: process.env.SUCCESS_URL,
    fail_url: process.env.FAIL_URL,
    cancel_url: process.env.CANCEL_URL,
    sslValidationApi: process.env.SSL_VALIDATION_API,
  },
  smtp: {
    user_name: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    port: Number(process.env.SMTP_PORT) || 2525,
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    email_from: process.env.EMAIL_FROM,
    currency_locale: process.env.CURRENCY_LOCALE,
    currency_code: process.env.CURRENCY_CODE,
    timezone: process.env.TIMEZONE || 'UTC',
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    folder: process.env.CLOUDINARY_FOLDER || 'fixitnow',
  },
  contact: {
    email: process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL,
  },
};
