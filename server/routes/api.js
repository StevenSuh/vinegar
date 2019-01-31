const uuidv4 = require('uuid/v4');

const {
  urlGoogle,
  getGoogleAccountFromCode,
} = require('auth-utils');

const dbClient = require('db')();
const Users = require('db/users/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);

module.exports = (app) => {
  // authentication
  app.get('/api/signin', (req, res) => {
    if (req.cookies.userCookieId) {
      return res.json({ signinUrl: '/find' });
    }
    return res.json({ signinUrl: urlGoogle() });
  });
  app.post('/api/create/session', (req, res) => { // findorcreate
    // active, content, duration, id, participants,schoolName,sessionName,
    Sessions.findOrCreate({
      where: {
        sessionName: req.body.sessionName,
        schoolName: req.body.schoolName,
      },
      defaults: {
        sessionName: req.body.sessionName,
        schoolName: req.body.schoolName,
      },
    }).spread((_user, created) => {
      if (created) {
        return res.json({
          created: true,
          schoolName: req.body.schoolName,
          sessionName: req.body.sessionName,
        });
      }

      return res.json({
        created: false,
        schoolName: req.body.schoolName,
        sessionName: req.body.sessionName,
      });
    });
    /* Sessions.create({
      "sessionName": req.body.sessionName,
      "schoolName": req.body.schoolName,


    }).then(console.log("wowowowowowowowow")) */
  });

  app.get('/api/auth/status', async (req, res) => {
    const { userCookieId } = req.cookies;
    if (!userCookieId) {
      return res.json({ isAuthenticated: false });
    }

    const user = await Users.findOne({ where: { cookieId: userCookieId } });

    if (!user) {
      res.clearCookie('userCookieId');
      return res.json({ isAuthenticated: false });
    }
    return res.json({ isAuthenticated: true });
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
      cookieId: userCookieId,
    });

    res.cookie('userCookieId', userCookieId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: false, // TODO: change to true
    });

    res.redirect('/find');
  });

  app.get('/api/search/session', async (req, res) => {
    const {
      limit = 5,
      offset = 0,
      query = '',
    } = req.query;

    const searchQuery = query.toLowerCase();
    const sessions = await Sessions.findAllByFullName({
      attributes: [
        Sessions.CREATED_AT,
        Sessions.ID,
        Sessions.PASSWORD,
        Sessions.SCHOOL_NAME,
        Sessions.SESSION_NAME,
      ],
      limit,
      offset,
      query: searchQuery,
    });

    res.json(sessions.map(({
      createdAt,
      id,
      password,
      schoolName,
      sessionName,
    }) => ({
      createdAt,
      id,
      password: Boolean(password),
      schoolName,
      sessionName,
    })));
  });
};
