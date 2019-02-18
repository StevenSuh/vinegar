const redisClient = require('services/redis')();

const { createUser, getNamesByReferer } = require('routes/api/middleware');

module.exports = (app) => {
  app.get('/api/signin', async (req, res) => {
    const { cookieId: existingCookie } = req.cookies;
    if (existingCookie) {
      return res.json({});
    }

    await createUser(res);
    return res.json({});
  });

  app.get('/api/auth/status', async (req, res) => {
    const { cookieId } = req.cookies;
    if (!cookieId) {
      await createUser(res);
      return res.json({ validSession: false });
    }

    let validSession = false;
    const sessionExists = await redisClient.hexistsAsync(cookieId, redisClient.SESSION_ID);

    if (sessionExists) {
      const schoolName = await redisClient.hgetAsync(cookieId, redisClient.SESSION_SCHOOL);
      const sessionName = await redisClient.hgetAsync(cookieId, redisClient.SESSION_NAME);

      const names = getNamesByReferer(req.headers.referer);
      const sessionsPage = names.schoolName && names.sessionName;

      if (sessionsPage) {
        const sameSession = (names.schoolName === schoolName) && (names.sessionName === sessionName);

        if (sameSession) {
          validSession = true;
        }
      }
    }

    const userIdExists = await redisClient.hexistsAsync(cookieId, redisClient.USER_ID);
    if (!userIdExists) {
      await createUser(res);
    }

    return res.json({ validSession });
  });

  app.get('/api/signout', (req, res) => {
    const { cookieId } = req.cookies;

    res.clearCookie('cookieId');
    redisClient.delAsync(cookieId);

    res.end();
  });
};
