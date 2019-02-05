const {
  passwordDigest,
  passwordIteration,
  passwordKeyLen,
  passwordSalt,
} = require('config');

const crypto = require('crypto');
const redisClient = require('services/redis')();

const dbClient = require('db')();
const Users = require('db/users/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);

const {
  requireUserAuth,
  requireSessionAuth,
  requireSessionByReferer,
} = require('routes/api/middleware');

const { generateColor } = require('./utils');

module.exports = (app) => {
  app.get('/api/session', async (req, res) => {
    res.json({});
  });

  app.get(
    '/api/session/search',
    requireUserAuth,
    async (req, res) => {
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

      return res.json(sessions.map(({
        createdAt,
        password,
        schoolName,
        sessionName,
      }) => ({
        createdAt,
        password: Boolean(password),
        schoolName,
        sessionName,
      })));
    },
  );

  app.post(
    '/api/session/create',
    requireUserAuth,
    (req, res) => { // findorcreate
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
    },
  );

  app.get(
    '/api/session/password',
    requireUserAuth,
    requireSessionByReferer,
    async (req, res) => {
      const password = req.session.get(Sessions.PASSWORD);

      return res.json({ hasPassword: Boolean(password) });
    },
  );

  app.post(
    '/api/session/password',
    requireUserAuth,
    requireSessionByReferer,
    async (req, res) => {
      const sessionId = req.session.get(Sessions.ID);
      const sessionPassword = req.session.get(Sessions.PASSWORD);

      const { password } = req.body;

      const hash = await new Promise((resolve, reject) => {
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
      });

      const validPassword = (sessionPassword === hash);

      if (validPassword) {
        const { cookieId } = req.cookies;
        const schoolName = req.session.get(Sessions.SCHOOL_NAME);
        const sessionName = req.session.get(Sessions.SESSION_NAME);

        await redisClient.hsetAsync(cookieId, redisClient.SESSION_ID, sessionId);
        await redisClient.hsetAsync(cookieId, redisClient.SESSION_SCHOOL, schoolName);
        await redisClient.hsetAsync(cookieId, redisClient.SESSION_NAME, sessionName);

        const [result] = await Users.update({ sessionId }, { where: { id: req.userId }});
        if (!result) {
          res.clearCookie('cookieId');
          await redisClient.hdelAsync(req.cookies.cookieId);
          return res.status(400).send('Invalid user.');
        }
      }

      return res.json({ validPassword });
    },
  );

  app.post(
    '/api/session/enter',
    requireUserAuth,
    async (req, res) => {
      const hasPassword = req.session.get(Sessions.PASSWORD);
      if (hasPassword) {
        const middle = await requireSessionAuth(req, res);
        if (!middle) {
          return null;
        }
      } else {
        const middle = await requireSessionByReferer(req, res);
        if (!middle) {
          return null;
        }
      }

      const { name, phone } = req.body;
      const color = generateColor();

      const session = req.session || Sessions.findOne({ where: { id: req.sessionId }});
      const sessionId = session.get(Sessions.ID);

      const updateItem = { color, name };
      if (phone) {
        updateItem.phone = phone;
      }

      if (!hasPassword) {
        const { cookieId } = req.cookies;
        const schoolName = req.session.get(Sessions.SCHOOL_NAME);
        const sessionName = req.session.get(Sessions.SESSION_NAME);

        await redisClient.hsetAsync(cookieId, redisClient.SESSION_ID, sessionId);
        await redisClient.hsetAsync(cookieId, redisClient.SESSION_SCHOOL, schoolName);
        await redisClient.hsetAsync(cookieId, redisClient.SESSION_NAME, sessionName);

        updateItem.sessionId = sessionId;
      }

      const [result] = await Users.update(updateItem, { where: { id: req.userId }});
      if (!result) {
        res.clearCookie('cookieId');
        await redisClient.hdelAsync(req.cookies.cookieId);
        return res.status(400).send('Invalid user.');
      }

      return res.json({ color });
    },
  );
};
