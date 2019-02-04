const authRoutes = require('./auth');
const sessionRoutes = require('./session');
const userRoutes = require('./user');

module.exports = (app) => {
  authRoutes(app);
  sessionRoutes(app);
  userRoutes(app);
};
