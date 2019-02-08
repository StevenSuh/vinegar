const redisClient = require('services/redis')();

const dbClient = require('db')();
const Users = require('db/users/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);

const {
  requireUserAuth,
  requireSessionAuth,
  requireSessionByReferer,
} = require('routes/api/middleware');

const { MIN_PASSWORD_LENGTH, MIN_SEARCH_LEN } = require('defs');
const {
  createPassword,
  generateColor,
  setSessionCookie,
} = require('./utils');

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

      if (searchQuery.length < MIN_SEARCH_LEN) {
        return res.status(400).send('Search query is too short.');
      }

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
    async (req, res) => {
      const {
        duration,
        password,
        schoolName,
        sessionName,
      } = req.body;

      const validForm = (duration > 0) &&
        (!password || password.length >= MIN_PASSWORD_LENGTH) &&
        schoolName && sessionName;

      if (!validForm) {
        return res.status(400).send('Form has an error.');
      }

      const encryptedPw = await createPassword(password);

      const session = await Sessions.create({
        active: true,
        duration,
        ownerId: req.userId,
        password: encryptedPw,
        schoolName,
        sessionName,
      });

      if (!session) {
        return res.status(400).send('Session failed to create.');
      }
      return res.end();
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
      const sessionPassword = req.session.get(Sessions.PASSWORD);

      const { password } = req.body;

      const hash = await createPassword(password);
      const validPassword = (sessionPassword === hash);

      if (validPassword) {
        const sessionId = req.session.get(Sessions.ID);
        const schoolName = req.session.get(Sessions.SCHOOL_NAME);
        const sessionName = req.session.get(Sessions.SESSION_NAME);

        setSessionCookie(res, { sessionId, schoolName, sessionName });

        const [result] = await Users.update({
          color: '',
          name: '',
          sessionId,
        }, { where: { id: req.userId }});

        if (!result) {
          res.clearCookie('sessionCookieId');
          res.clearCookie('userCookieId');
          await redisClient.delAsync(req.cookies.sessionCookieId);
          await redisClient.delAsync(req.cookies.userCookieId);
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
      const { sessionCookieId } = req.cookies;
      if (sessionCookieId) {
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

      if (!sessionCookieId) {
        const schoolName = session.get(Sessions.SCHOOL_NAME);
        const sessionName = session.get(Sessions.SESSION_NAME);

        setSessionCookie(res, { sessionId, schoolName, sessionName });
        updateItem.sessionId = sessionId;
      }

      const [result] = await Users.update(updateItem, { where: { id: req.userId }});
      if (!result) {
        res.clearCookie('sessionCookieId');
        res.clearCookie('userCookieId');
        await redisClient.delAsync(req.cookies.sessionCookieId);
        await redisClient.delAsync(req.cookies.userCookieId);
        return res.status(400).send('Invalid user.');
      }

      return res.json({ color });
    },
  );
};
