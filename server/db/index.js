const Sequelize = require('sequelize');
const {
  pgDbName,
  pgUsername,
  pgPassword,
} = require('config');
const getChatsModel = require('./chats/model');
const getIntervalsModel = require('./intervals/model');
const getSessionsModel = require('./sessions/model');
const getUsersModel = require('./users/model');

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

    const Chats = getChatsModel(dbClient);
    const Intervals = getIntervalsModel(dbClient);
    const Sessions = getSessionsModel(dbClient);
    const Users = getUsersModel(dbClient);

    // create tables
    await Chats.sync({ alter: false, force: false });
    await Intervals.sync({ alter: false, force: false });
    await Sessions.sync({ alter: false, force: false });
    await Users.sync({ alter: false, force: false });

    /*
      associations

      as = name for the getter method
       - as: 'User' -> getUser
    */
    Sessions.hasMany(Chats, {
      as: 'ChatMessages',
      foreignKey: { allowNull: false, name: 'sessionId' },
    });
    Users.hasMany(Chats, {
      as: 'ChatMessages',
      foreignKey: { allowNull: false, name: 'userId' },
    });

    Sessions.hasMany(Intervals, {
      as: 'Intervals',
      foreignKey: { allowNull: false, name: 'sessionId' },
    });
    Users.hasMany(Intervals, {
      as: 'Intervals',
      foreignKey: { allowNull: false, name: 'userId' },
    });

    Sessions.belongsTo(Users, {
      as: 'Owner',
      foreignKey: { allowNull: false, name: 'ownerId' },
    });
    Sessions.hasMany(Users, {
      as: 'Users',
      foreignKey: { allowNull: true, name: 'sessionId' },
    });

    // order of operation matters
    await Intervals.sync({ alter: true, force: false });
    await Chats.sync({ alter: true, force: false });
    await Users.sync({ alter: true, force: false });
    await Sessions.sync({ alter: true, force: false });
  }

  return dbClient;
};
