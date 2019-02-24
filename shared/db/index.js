const Sequelize = require('sequelize');
const {
  pgDbName,
  pgHost,
  pgPassword,
  pgPort,
  pgUsername,
} = require('config');
const getChatsModel = require('./chats/model');
const getIntervalsModel = require('./intervals/model');
const getIntervalManagersModel = require('./intervalManagers/model');
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
        host: pgHost,
        logging: false,
        operatorsAliases: false,
        port: pgPort,
      },
    );

    const Chats = getChatsModel(dbClient);
    const Intervals = getIntervalsModel(dbClient);
    const IntervalManagers = getIntervalManagersModel(dbClient);
    const Sessions = getSessionsModel(dbClient);
    const Users = getUsersModel(dbClient);

    // create tables
    await Chats.sync({ alter: false, force: false });
    await Intervals.sync({ alter: false, force: false });
    await IntervalManagers.sync({ alter: false, force: false });
    await Sessions.sync({ alter: false, force: false });
    await Users.sync({ alter: false, force: false });

    // associations
    Sessions.hasMany(Chats, {
      as: 'Chats',
      foreignKey: { allowNull: false, name: 'sessionId' },
      onDelete: 'cascade',
    });
    Users.hasMany(Chats, {
      as: 'Chats',
      foreignKey: { allowNull: false, name: 'userId' },
    });

    Intervals.belongsTo(Users, {
      as: 'User',
      foreignKey: { allowNull: false, name: 'userId' },
    });
    IntervalManagers.hasMany(Intervals, {
      as: 'Intervals',
      foreignKey: { allowNull: false, name: 'intervalManagerId' },
      onDelete: 'cascade',
    });
    Sessions.belongsTo(Intervals, {
      as: 'CurrentInterval',
      foreignKey: { allowNull: true, name: 'currentIntervalId' },
    });
    Sessions.hasMany(Intervals, {
      as: 'Intervals',
      foreignKey: { allowNull: false, name: 'sessionId' },
      onDelete: 'cascade',
    });

    IntervalManagers.belongsTo(Sessions, {
      as: 'Session',
      foreignKey: { allowNull: false, name: 'sessionId' },
    })
    Sessions.hasOne(IntervalManagers, {
      as: 'Manager',
      foreignKey: { allowNull: false, name: 'sessionId' },
      onDelete: 'cascade',
    });

    Sessions.belongsTo(Users, {
      as: 'Owner',
      foreignKey: { allowNull: false, name: 'ownerId' },
    });
    Sessions.hasMany(Users, {
      as: 'Users',
      foreignKey: { allowNull: true, name: 'sessionId' },
    });

    // with association
    await Chats.sync({ alter: true, force: false });
    await Intervals.sync({ alter: true, force: false });
    await IntervalManagers.sync({ alter: true, force: false });
    await Users.sync({ alter: true, force: false });
    await Sessions.sync({ alter: true, force: false });
  }

  return dbClient;
};
