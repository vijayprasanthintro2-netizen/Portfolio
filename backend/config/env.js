import 'dotenv/config';

const required = [];

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  contactToEmail: process.env.CONTACT_TO_EMAIL || '',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

export const isSmtpConfigured = () =>
  Boolean(env.smtp.host && env.smtp.user && env.smtp.pass && env.contactToEmail);

export function validateEnv() {
  const missing = required.filter((key) => !env[key]);
  if (missing.length) {
    console.warn(`[config] Missing env keys: ${missing.join(', ')}`);
  }
}
