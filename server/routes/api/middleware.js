const redisClient = require('services/redis')();
const pathToRegexp = require('path-to-regexp');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);

const sessionRegex = pathToRegexp('/session/:school/:session');

const requireUserAuth = async (req, res, next = Function) => {
  const { cookieId } = req.cookies;
  if (!cookieId) {
    res.status(400).send('Invalid cookie.');
    return false;
  }

  const userId = await redisClient.hgetAsync(cookieId, redisClient.USER_ID);
  if (!userId) {
    res.status(400).send('Invalid user.');
    return false;
  }

  req.userId = userId;
  return next();
};

const getNamesByReferer = (referer) => {
  const decodedUrl = decodeURI(referer);
  const urlEnding = decodedUrl.slice(decodedUrl.split('/', 3).join('/').length);
  const sessionParse = sessionRegex.exec(urlEnding) || [];

  return {
    schoolName: sessionParse[1],
    sessionName: sessionParse[2],
  };
};

const requireSessionByReferer = async (req, res, next = Function) => {
  const { schoolName, sessionName } = getNamesByReferer(req.headers.referer);

  if (!schoolName || !sessionName) {
    res.status(400).send('Session name is invalid.');
    return false;
  }

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

const requireSessionAuth = async (req, res, next = Function) => {
  const { cookieId } = req.cookies;
  if (!cookieId) {
    res.status(400).send('Invalid cookie.');
    return false;
  }

  const sessionId = await redisClient.hgetAsync(cookieId, redisClient.SESSION_ID);
  const schoolName = await redisClient.hgetAsync(cookieId, redisClient.SESSION_SCHOOL);
  const sessionName = await redisClient.hgetAsync(cookieId, redisClient.SESSION_NAME);
  if (!sessionId || !schoolName || !sessionName) {
    res.status(400).send('Invalid session.');
    return false;
  }

  const names = getNamesByReferer(req.headers.referer);
  if (
    schoolName !== names.schoolName ||
    sessionName !== names.sessionName
  ) {
    res.status(400).send('User is authenticated with different session.');
    return false;
  }

  req.sessionId = sessionId;
  req.schoolName = schoolName;
  req.sessionName = sessionName;
  return next();
};


module.exports = {
  getNamesByReferer,
  requireUserAuth,
  requireSessionAuth,
  requireSessionByReferer,
};
