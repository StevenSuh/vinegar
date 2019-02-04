const redisClient = require('services/redis')();
const pathToRegexp = require('path-to-regexp');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const sessionRegex = pathToRegexp('/session/:school/:session');

const requireUserAuth = async (req, res, next = Function) => {
  const { cookieId } = req.cookies;
  if (!cookieId) {
    res.status(400).send('Invalid user.');
    return false;
  }

  const userId = await redisClient.hgetAsync(cookieId, redisClient.USER);

  if (!userId) {
    res.status(400).send('Invalid user.');
    return false;
  }
  req.userId = userId;
  return next();
};

const requireUserAuthWithData = async (req, res, next = Function) => {
  const middle = await requireUserAuth(req, res);
  if (!middle) {
    return null;
  }

  const user = await Users.findOne({ where: { id: req.userId }});

  if (!user) {
    res.clearCookie('cookieId');
    await redisClient.hdelAsync(req.cookies.cookieId, redisClient.USER);
    res.status(400).send('User does not exist.');
    return false;
  }

  req.user = user;
  return next();
};

const requireSessionByReferer = async (req, res, next = Function) => {
  const { referer } = req.headers;
  const decodedUrl = decodeURI(referer);
  const urlEnding = decodedUrl.slice(decodedUrl.split('/', 3).join('/').length);

  const sessionParse = sessionRegex.exec(urlEnding);

  if (!sessionParse) {
    res.status(400).send('Session name is invalid.');
    return false;
  }

  const schoolName = sessionParse[1];
  const sessionName = sessionParse[2];

  const session = await Sessions.findActiveBySchoolAndSession({
    schoolName,
    sessionName,
  });

  if (!session) {
    return res.status(400).send('Session does not exist.');
  }

  req.session = session;
  return next();
};

const requireSessionAuthWithData = async (req, res, next = Function) => {
  const middle = await requireSessionByReferer(req, res);
  if (!middle) {
    return null;
  }

  const { cookieId } = req.cookies;
  if (!cookieId) {
    res.json({ validSession: false });
    return false;
  }

  const sessionId = await redisClient.hgetAsync(cookieId, redisClient.SESSION);
  if (!sessionId) {
    res.status(400).send('Invalid session.');
    return false;
  }

  if (sessionId !== req.session.get(Sessions.ID)) {
    await redisClient.hdelAsync(cookieId, redisClient.SESSION );
    res.status(400).send('Invalid session.');
    return false;
  }

  return next();
};


module.exports = {
  requireUserAuth,
  requireUserAuthWithData,
  requireSessionAuthWithData,
  requireSessionByReferer,
};
