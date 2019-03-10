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
    retry: {
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      name: 'query',
      backoffBase: 100,
      backoffExponent: 1.1,
      timeout: 60000,
      max: Infinity,
    },
  },
);

module.exports = dbClient;
