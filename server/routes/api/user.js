const Users = require('db/users/model');

const { requireSessionAuth, requireUserAuth } = require('routes/api/middleware');

module.exports = (app) => {
  app.get(
    '/api/user/session',
    requireUserAuth,
    requireSessionAuth,
    async (req, res) => {
      const user = await Users.findOne({ where: { id: req.userId }});
      return res.json({
        color: user.get(Users.COLOR),
        name: user.get(Users.NAME),
      });
    },
  );
};
