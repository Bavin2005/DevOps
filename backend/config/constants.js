module.exports = {
  JWT_SECRET: (process.env.JWT_SECRET || "jwt_secret_key_123").trim(),
  COMPANY_EMAIL_DOMAIN: (process.env.COMPANY_EMAIL_DOMAIN || "company.com").trim(),
};
  