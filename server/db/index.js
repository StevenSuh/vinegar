const { Pool } = require('pg');
const Sequelize = require('sequelize');

let dbClient = null;

module.exports = async () => {
  if (!dbClient) {
    dbClient = new Sequelize(
      'postgres', // database
      'postgres', // username
      'postgres', // password
      {
        dialect: 'postgres',
        host: 'localhost',
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
    await Intervals.sync({ force: false });
    await Rooms.sync({ force: false });
    await Users.sync({ force: false });
  }

  return dbClient;
};
