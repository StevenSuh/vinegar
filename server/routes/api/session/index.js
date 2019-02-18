const redisClient = require('services/redis')();

const dbClient = require('db')();
const Chats = require('db/chats/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const {
  requireUserAuth,
  requireSessionAuth,
  requireSessionByReferer,
} = require('routes/api/middleware');

const {
  ALLOWED_CHARACTERS,
  DEFAULT_COLOR,
  DEFAULT_CREATE_MSG,
  MIN_PASSWORD_LENGTH,
} = require('defs');
const {
  createPassword,
  generateColor,
  setSessionCookie,
} = require('./utils');

const nameRegex = new RegExp(`^[${ALLOWED_CHARACTERS.join('')}]+$`);

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
    async (req, res) => {
      const {
        duration,
        password,
        schoolName,
        sessionName,
      } = req.body;

      const validForm = (duration > 0) &&
        (!password || password.length >= MIN_PASSWORD_LENGTH) &&
        nameRegex.test(schoolName) && nameRegex.test(sessionName);

      if (!validForm) {
        return res.status(400).send('Form has an error.');
      }

      const defaults = {
        active: true,
        duration,
        ownerId: req.userId,
        schoolName,
        sessionName,
      };

      if (password) {
        const encryptedPw = await createPassword(password);
        defaults.password = encryptedPw;
      }

      const [session, created] = await Sessions.findOrCreate({
        where: {
          active: true,
          schoolName,
          sessionName,
        },
        defaults,
      });

      if (!session) {
        return res.status(400).send('Session failed to create.');
      }
      if (!created) {
        return res.status(400).send('Session already exists. Try a different name.');
      }

      await Chats.create({
        color: DEFAULT_COLOR,
        message: DEFAULT_CREATE_MSG,
        name: `${schoolName}/${sessionName}`,
        sessionId: session.get(Sessions.ID),
        type: Chats.TYPE_SYSTEM,
        userId: req.userId,
      });

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

        setSessionCookie({
          cookieId: req.cookies.cookieId,
          sessionId,
          schoolName,
          sessionName,
        });

        const [result] = await Users.update({
          color: '',
          name: '',
          sessionId,
        }, { where: { id: req.userId }});

        if (!result) {
          res.clearCookie('cookieId');
          await redisClient.delAsync(req.cookies.cookieId);
          return res.status(400).send('Invalid user.');
        }
      }

      return res.json({ validPassword });
    },
  );

  app.post(
    '/api/session/enter',
    requireUserAuth,
    requireSessionByReferer,
    async (req, res) => {
      const { cookieId } = req.cookies;
      const passwordExists = req.session.get(Sessions.PASSWORD);

      if (passwordExists) {
        const middle = await requireSessionAuth(req, res);
        if (!middle) {
          return null;
        }
      }

      const { name, phone } = req.body;
      const color = generateColor();

      const { session } = req;
      const sessionId = session.get(Sessions.ID);

      const updateItem = { color, name };
      if (phone) {
        updateItem.phone = phone;
      }

      if (!passwordExists) {
        setSessionCookie({
          cookieId,
          sessionId,
          schoolName: session.get(Sessions.SCHOOL_NAME),
          sessionName: session.get(Sessions.SESSION_NAME),
        });
        updateItem.sessionId = sessionId;
      }

      const [result] = await Users.update(updateItem, { where: { id: req.userId }});
      if (!result) {
        res.clearCookie('cookieId');
        await redisClient.delAsync(cookieId);
        return res.status(400).send('Invalid user.');
      }

      return res.end();
    },
  );
};
