module.exports = {
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirect: process.env.GOOGLE_REDIRECT_URL,
  pgDbName: process.env.POSTGRES_DATABASE_NAME,
  pgHost: process.env.POSTGRES_HOST,
  pgUsername: process.env.POSTGRES_USERNAME,
  pgPassword: process.env.POSTGRES_PASSWORD,
  pgPort: process.env.POSTGRES_PORT,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
};
