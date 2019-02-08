const {
  passwordDigest,
  passwordIteration,
  passwordKeyLen,
  passwordSalt,
} = require('config');

const crypto = require('crypto');
const uuidv4 = require('uuid/v4');

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
  setSessionCookie: async (
    res,
    { sessionId, schoolName, sessionName },
  ) => {
    const sessionCookieId = uuidv4();

    res.cookie('sessionCookieId', sessionCookieId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      secure: false, // TODO: change to true
    });

    await redisClient.hsetAsync(sessionCookieId, redisClient.SESSION_ID, sessionId);
    await redisClient.hsetAsync(sessionCookieId, redisClient.SESSION_SCHOOL, schoolName);
    await redisClient.hsetAsync(sessionCookieId, redisClient.SESSION_NAME, sessionName);

    redisClient.expireAsync(sessionCookieId, 60 * 60 * 24);

    return true;
  },
};
