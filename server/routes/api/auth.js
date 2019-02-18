const uuidv4 = require('uuid/v4');
const redisClient = require('services/redis')();

const dbClient = require('db')();
const Users = require('db/users/model')(dbClient);

const { getNamesByReferer } = require('routes/api/middleware');

module.exports = (app) => {
  app.get('/api/signin', async (req, res) => {
    const { cookieId: existingCookie } = req.cookies;
    if (existingCookie) {
      return res.json({});
    }

    const user = await Users.create();

    const cookieId = uuidv4();
    res.cookie('cookieId', cookieId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: false, // TODO: change to true
    });

    await redisClient.hsetAsync(cookieId, redisClient.USER_ID, user.get(Users.ID));
    redisClient.expireAsync(cookieId, 60 * 60 * 24 * 7);

    return res.json({});
  });

  app.get('/api/auth/status', async (req, res) => {
    const { cookieId } = req.cookies;
    if (!cookieId) {
      return res.json({ validSession: false, validUser: false });
    }

    let validSession = false;
    const sessionExists = await redisClient.hexistsAsync(cookieId, redisClient.SESSION_ID);

    if (sessionExists) {
      const schoolName = await redisClient.hgetAsync(cookieId, redisClient.SESSION_SCHOOL);
      const sessionName = await redisClient.hgetAsync(cookieId, redisClient.SESSION_NAME);

      const names = getNamesByReferer(req.headers.referer);
      const sessionsPage = names.schoolName && names.sessionName;

      if (sessionsPage) {
        const sameSession = (names.schoolName === schoolName) && (names.sessionName === sessionName);

        if (sameSession) {
          validSession = true;
        }
      }
    }

    const userIdExists = await redisClient.hexistsAsync(cookieId, redisClient.USER_ID);

    return res.json({ validUser: Boolean(userIdExists), validSession });
  });

  app.get('/api/signout', (req, res) => {
    const { cookieId } = req.cookies;

    res.clearCookie('cookieId');
    redisClient.delAsync(cookieId);

    res.end();
  });
};
