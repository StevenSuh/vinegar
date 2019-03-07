const redisClient = require('services/redis');

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
    const sessionExists = await redisClient.hexistsAsync(redisClient.sessionId({ cookieId }));

    if (sessionExists) {
      const sessionId = await redisClient.hgetAsync(redisClient.sessionId({ cookieId }));
      const schoolName = await redisClient.hgetAsync(redisClient.sessionSchool({ cookieId, sessionId }));
      const sessionName = await redisClient.hgetAsync(redisClient.sessionName({ cookieId, sessionId }));

      const names = getNamesByReferer(req.headers.referer);
      const sessionsPage = names.schoolName && names.sessionName;

      if (sessionsPage) {
        const sameSession = (names.schoolName === schoolName) && (names.sessionName === sessionName);

        if (sameSession) {
          validSession = true;
        }
      }
    }

    const userIdExists = await redisClient.hexistsAsync(redisClient.userId({ cookieId }));
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
