const authRoutes = require('./auth');
const sessionRoutes = require('./session');

module.exports = (app) => {
  authRoutes(app);
  sessionRoutes(app);
};
