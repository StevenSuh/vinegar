const {
  passwordDigest,
  passwordIteration,
  passwordKeyLen,
  passwordSalt,
} = require('config');

const crypto = require('crypto');

const redisClient = require('services/redis')();

const colorLetters = '0123456789ABCDEF';

module.exports = {
  createPassword: (password) =>
    new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        passwordSalt,
        passwordIteration,
        passwordKeyLen,
        passwordDigest,
        (err, derivedKey) => {
          if (err) {
            throw reject(err);
          } else {
            resolve(derivedKey.toString('hex'));
          }
        },
      );
    }),
  generateColor: () => {
    let color = '#';

    for (let i = 0; i < 6; i += 1) {
      color += colorLetters[Math.floor(Math.random() * 16)];
    }
    return color;
  },
  setSessionCookie: async ({
    cookieId,
    sessionId,
    schoolName,
    sessionName,
  }) => {
    await redisClient.hsetAsync(cookieId, redisClient.SESSION_ID, sessionId);
    await redisClient.hsetAsync(cookieId, redisClient.SESSION_SCHOOL, schoolName);
    await redisClient.hsetAsync(cookieId, redisClient.SESSION_NAME, sessionName);

    return true;
  },
};
