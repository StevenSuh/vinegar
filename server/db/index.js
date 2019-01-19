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

    const Users = require('./UsersModel')(dbClient);
    const Rooms = require('./RoomsModel')(dbClient);

    // associations
    Users.belongsTo(Rooms);

    // table creation if non-existent
    await Users.sync({ force: false });
    await Rooms.sync({ force: false });
  }

  return dbClient;
};
