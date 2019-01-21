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
    const Rooms = require('./RoomsModel')(dbClient);
    const Users = require('./UsersModel')(dbClient);

    // associations
    Intervals.belongsTo(Users);
    Intervals.belongsTo(Rooms);
    Users.belongsTo(Rooms);

    // table creation if non-existent
    // note: order of operation depends on table associations
    await Rooms.sync({ alter: true, force: false });
    await Users.sync({ alter: true, force: false });
    await Intervals.sync({ alter: true, force: false });
  }

  return dbClient;
};
