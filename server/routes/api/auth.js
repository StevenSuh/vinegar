const uuidv4 = require('uuid/v4');
const {
  urlGoogle,
  getGoogleAccountFromCode,
} = require('auth-utils');
const redisClient = require('services/redis')();

const dbClient = require('db')();
const Users = require('db/users/model')(dbClient);

module.exports = (app) => {
  app.get('/api/signin', (req, res) => {
    if (req.cookies.cookieId) {
      return res.json({ signinUrl: '/find' });
    }
    return res.json({ signinUrl: urlGoogle() });
  });

  app.get('/api/auth/status', async (req, res) => {
    const { cookieId } = req.cookies;
    if (!cookieId) {
      return res.json({ validSession: false, validUser: false });
    }

    const userIdPromise = redisClient.hexistsAsync(cookieId, redisClient.USER);
    const sessionIdPromise = redisClient.hexistsAsync(cookieId, redisClient.SESSION);

    const [userId, sessionId] = await Promise.all([userIdPromise, sessionIdPromise]);

    return res.json({ validUser: Boolean(userId), validSession: Boolean(sessionId) });
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

    const cookieId = uuidv4();
    res.cookie('cookieId', cookieId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: false, // TODO: change to true
    });
    await redisClient.hsetAsync(cookieId, redisClient.USER, user.get(Users.ID));

    res.redirect('/find');
  });
};
