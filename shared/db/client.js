const Sequelize = require('sequelize');
const {
  pgDbName,
  pgHost,
  pgPassword,
  pgPort,
  pgUsername,
} = require('config');

const dbClient = new Sequelize(
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

module.exports = dbClient;
