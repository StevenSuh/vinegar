const redisClient = require('services/redis')();
const pathToRegexp = require('path-to-regexp');
const uuidv4 = require('uuid/v4');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const sessionRegex = pathToRegexp('/app/session/:school/:session');

const createUser = async (res) => {
  const user = await Users.create();

  const cookieId = uuidv4();
  res.cookie('cookieId', cookieId, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 30, // 1 month
    secure: false, // TODO: change to true
  });

  await redisClient.hsetAsync(cookieId, redisClient.USER_ID, user.get(Users.ID));
  redisClient.expireAsync(cookieId, 60 * 60 * 24 * 30); // 1 month

  return user;
}

const requireUserAuth = async (req, res, next = Function) => {
  let user = false;
  let userId = null;

  const { cookieId } = req.cookies;
  if (cookieId) {
    userId = await redisClient.hgetAsync(cookieId, redisClient.USER_ID);
    if (userId) {
      user = true;
    } else {
      res.clearCookie('cookieId');
    }
  }

  if (!user) {
    user = await createUser(res);
    userId = user.get(Users.ID);
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

  const session = await Sessions.findBySchoolAndSession({
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
  createUser,
  getNamesByReferer,
  requireUserAuth,
  requireSessionAuth,
  requireSessionByReferer,
};
