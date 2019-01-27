const uuidv4 = require('uuid/v4');

const {
  urlGoogle,
  getGoogleAccountFromCode,
} = require('../auth-utils');

const dbClient = require('../db')();
const Users = require('../db/users/model')(dbClient);
const Sessions = require('../db/sessions/model')(dbClient);

module.exports = (app) => {
  // authentication
  app.get('/api/signin', (req, res) => {
    if (req.cookies.cookieId) {
      return res.json({ signinUrl: '/find' });
    }
    return res.json({ signinUrl: urlGoogle() });
  });
  app.post('/api/create/session', (req, res) =>{ //findorcreate
    //active, content, duration, id, participants,schoolName,sessionName,
    Sessions.findOrCreate({where: {sessionName: req.body.sessionName,
       schoolName: req.body.schoolName}, defaults: {
      "sessionName": req.body.sessionName,
      "schoolName": req.body.schoolName,
    }})
    .spread((user, created) => {

      if(created){
        return res.json({
          created: true,
          schoolName: req.body.schoolName,
          sessionName: req.body.sessionName
        })
      }
      else{
        return res.json({
          created: false,
          schoolName: req.body.schoolName,
          sessionName: req.body.sessionName
        })
      }
    })
   /* Sessions.create({
      "sessionName": req.body.sessionName,
      "schoolName": req.body.schoolName,


    }).then(console.log("wowowowowowowowow")) */


  })

  app.get('/api/auth/status', async (req, res) => {
    const { cookieId } = req.cookies;
    if (!cookieId) {
      return res.json({ isAuthenticated: false });
    }

    const user = await Users.findOne({ where: { cookieId } });
    if (!user) {
      res.clearCookie('cookieId');
      return res.json({ isAuthenticated: false });
    }
    return res.json({
      isAuthenticated: true,
      uid: user.getDataValue(Users.id),
    });
  });

  app.get('/api/callback', async (req, res) => {
    const { code } = req.query;

    const {
      gid,
      email,
    } = await getGoogleAccountFromCode(code);

    const cookieId = uuidv4();

    // create or update user on db
    Users.upsert({
      active: false,
      email,
      gid,
      cookieId,
    });

    res.cookie('cookieId', cookieId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: false, // TODO: change to true
    });

    res.redirect('http://localhost:8080/find');
  });

  app.get('/api/search/session', async (req, res) => {
    const {
      limit = 5,
      offset = 0,
      query = '',
    } = req.query;

    const searchQuery = query.toLowerCase();
    const sessions = await Sessions.searchFullName({
      attributes: [Sessions.CREATED_AT, Sessions.SCHOOL_NAME, Sessions.SESSION_NAME, Sessions.ID],
      limit,
      offset,
      query: searchQuery,
    });

    res.json(sessions);
  });
};
