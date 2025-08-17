require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
  NODE_ENV: process.env.NODE_ENV || "development",
};
