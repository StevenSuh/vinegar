const uuidv4 = require('uuid/v4');

const {
  urlGoogle,
  getGoogleAccountFromCode,
} = require('../auth-utils');

const dbClient = require('../db')();
const Users = require('../db/UsersModel')(dbClient);

module.exports = (app) => {
  // authentication
  app.get('/api/signin', (req, res) => {
    if (req.cookies.sessionId) {
      return res.json({ signinUrl: '/find' });
    }
    return res.json({ signinUrl: urlGoogle() });
  });

  app.get('/callback', async (req, res) => {
    const { code } = req.query;

    const {
      gid,
      email,
      tokens: { expiry_date },
    } = await getGoogleAccountFromCode(code);

    const sessionId = uuidv4();

    // create or update user on db
    Users.upsert({
      active: false,
      email,
      gid,
      sessionId,
    });

    res.cookie('sessionId', sessionId, {
      expires: new Date(expiry_date),
      httpOnly: true,
      secure: false, // TODO: change to true
    });

    res.redirect('http://localhost:8080/find');
  });
};
