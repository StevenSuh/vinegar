const uuidv4 = require('uuid/v4');
const {
  urlGoogle,
  getGoogleAccountFromCode,
} = require('utils');
const redisClient = require('services/redis')();

const dbClient = require('db')();
const Users = require('db/users/model')(dbClient);

const { getNamesByReferer } = require('routes/api/middleware');

module.exports = (app) => {
  app.get('/api/signin', async (req, res) => {
    const { userCookieId } = req.cookies;
    if (!userCookieId) {
      return res.json({ signinUrl: urlGoogle() });
    }
    const exists = await redisClient.hexistsAsync(userCookieId, redisClient.USER_ID);
    if (!exists) {
      return res.json({ signinUrl: urlGoogle() });
    }
    return res.json({ signinUrl: '/find' });
  });

  app.get('/api/auth/status', async (req, res) => {
    const { sessionCookieId, userCookieId } = req.cookies;
    if (!userCookieId) {
      return res.json({ validSession: false, validUser: false });
    }

    let validSession = false;
    if (sessionCookieId) {
      const schoolName = await redisClient.hgetAsync(sessionCookieId, redisClient.SESSION_SCHOOL);
      const sessionName = await redisClient.hgetAsync(sessionCookieId, redisClient.SESSION_NAME);

      const names = getNamesByReferer(req.headers.referer);
      const sessionsPage = names.schoolName && names.sessionName;

      if (sessionsPage) {
        const sameSession = (names.schoolName === schoolName) && (names.sessionName === sessionName);
        if (!sameSession) {
          res.clearCookie('sessionCookieId');
          redisClient.delAsync(sessionCookieId);
        } else {
          validSession = true;
        }
      }
    }

    const userIdExists = await redisClient.hexistsAsync(userCookieId, redisClient.USER_ID);

    return res.json({ validUser: Boolean(userIdExists), validSession });
  });

  app.get('/api/callback', async (req, res) => {
    const { code } = req.query;

    const {
      gid,
      email,
    } = await getGoogleAccountFromCode(code);

    const [user] = await Users.findOrCreate({
      where: { gid },
      defaults: {
        active: false,
        email,
        gid,
      },
    });

    const userCookieId = uuidv4();
    res.cookie('userCookieId', userCookieId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: false, // TODO: change to true
    });
    await redisClient.hsetAsync(userCookieId, redisClient.USER_ID, user.get(Users.ID));
    redisClient.expireAsync(userCookieId, 60 * 60 * 24 * 7);

    res.redirect('/find');
  });

  app.get('/api/signout', (req, res) => {
    const { userCookieId } = req.cookies;

    res.clearCookie('userCookieId');
    redisClient.delAsync(userCookieId);

    res.end();
  });
};
