const dbClient = require('db')();
const Users = require('db/users/model')(dbClient);

const { requireUserAuthWithData } = require('routes/api/middleware');

module.exports = (app) => {
  app.get('/api/user/session', requireUserAuthWithData, async (req, res) => {
    return res.json({
      color: req.user.get(Users.COLOR),
      name: req.user.get(Users.NAME),
    });
  });
};
