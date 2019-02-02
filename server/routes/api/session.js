// const pathToRegexp = require('path-to-regexp');

const dbClient = require('db')();
// const Users = require('db/users/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);

// const sessionRegex = pathToRegexp('/session/:school/:session');

module.exports = (app) => {
  app.get('/api/session/search', async (req, res) => {
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

  app.post('/api/session/create', (req, res) => { // findorcreate
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

  app.get('/api/session/password', (req, res) => {
    res.json({});
  });

  app.post('/api/session/password', (req, res) => {
    // set sessionCookieId and user's color
    res.json({});
  });

  app.post('/api/session/enter', (req, res) => {
    res.json({});
  });
};
