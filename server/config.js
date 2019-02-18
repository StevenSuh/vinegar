module.exports = {
  passwordSalt: process.env.PASSWORD_SALT,
  passwordIteration: 100000,
  passwordKeyLen: 32,
  passwordDigest: 'sha256',
  pgDbName: process.env.POSTGRES_DATABASE_NAME,
  pgHost: process.env.POSTGRES_HOST,
  pgUsername: process.env.POSTGRES_USERNAME,
  pgPassword: process.env.POSTGRES_PASSWORD,
  pgPort: process.env.POSTGRES_PORT,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
};
