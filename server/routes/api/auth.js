const uuidv4 = require('uuid/v4');
const {
  urlGoogle,
  getGoogleAccountFromCode,
} = require('auth-utils');
// const pathToRegexp = require('path-to-regexp');

const dbClient = require('db')();
const Users = require('db/users/model')(dbClient);

// const sessionRegex = pathToRegexp('/session/:school/:session');

module.exports = (app) => {
  app.get('/api/signin', (req, res) => {
    if (req.cookies.userCookieId) {
      return res.json({ signinUrl: '/find' });
    }
    return res.json({ signinUrl: urlGoogle() });
  });

  app.get('/api/auth/status', async (req, res) => {
    // const { referer } = req.headers;
    // const urlEnding = referer.slice(referer.split('/', 3).join('/').length);

    // const isSession = Boolean(sessionRegex.exec(urlEnding));

    const { userCookieId } = req.cookies;
    if (!userCookieId) {
      return res.json({ validUser: false });
    }

    const user = await Users.findOne({ where: { userCookieId } });

    if (!user) {
      res.clearCookie('userCookieId');
      return res.json({ validUser: false });
    }
    return res.json({ validUser: true });
  });

  app.get('/api/callback', async (req, res) => {
    const { code } = req.query;

    const {
      gid,
      email,
    } = await getGoogleAccountFromCode(code);

    const userCookieId = uuidv4();

    // create or update user on db
    Users.upsert({
      active: false,
      email,
      gid,
      userCookieId,
    });

    res.cookie('userCookieId', userCookieId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: false, // TODO: change to true
    });

    res.redirect('/find');
  });
};
