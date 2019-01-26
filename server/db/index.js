const Sequelize = require('sequelize');
const {
  pgDbName,
  pgUsername,
  pgPassword,
} = require('../config');

let dbClient = null;

module.exports = async () => {
  if (!dbClient) {
    dbClient = new Sequelize(
      pgDbName, // database
      pgUsername, // username
      pgPassword, // password
      {
        dialect: 'postgres',
        host: 'localhost',
        operatorsAliases: false,
        port: 5432,
      },
    );

    const Intervals = require('./IntervalsModel')(dbClient);
    const Sessions = require('./SessionsModel')(dbClient);
    const Users = require('./UsersModel')(dbClient);
    const Chats = require('./chatModel')(dbClient);

    // create tables
    await Sessions.sync({ alter: true, force: false });
    await Users.sync({ alter: true, force: false });
    await Intervals.sync({ alter: true, force: false });

    // associations
    Intervals.belongsTo(Users, { foreignKey: 'userId' });
    Intervals.belongsTo(Sessions, { foreignKey: 'sessionId' });
    Sessions.hasMany(Intervals, { foreignKey: 'sessionId' });

    Users.belongsTo(Sessions, { foreignKey: 'sessionId' });

    Sessions.belongsTo(Users, { foreignKey: 'ownerId' });

    Chats.belongsTo(Users, {foreignKey: 'userId'})
    Chats.belongsTo(Sessions, {foreignKey: 'sessionId'})
    Users.hasMany(Chats, {foreignKey: 'userId'});
    Users.hasMany(Sessions, {foreignKey: 'sessionId'});


    // add table associations
    // note: order of operation depends on table associations
    await Sessions.sync({ alter: true, force: false });
    await Users.sync({ alter: true, force: false });
    await Intervals.sync({ alter: true, force: false });
    await Chats.sync({ alter: true, force: false });
  }

  return dbClient;
};
