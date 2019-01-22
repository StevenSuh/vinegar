const Sequelize = require('sequelize');

let Users = null;

module.exports = (dbClient) => {
  if (!Users) {
    Users = dbClient.define('users', {
      active: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      gid: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        defaultValue: '',
        type: Sequelize.STRING,
      },
      phone: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      cookieId: {
        allowNull: true,
        unique: false,
        type: Sequelize.STRING,
      },
      // sessionId,
    }, {
      indexes: [{ unique: true, fields: ['gid'] }],
      freezeTableName: true,
      timestamps: true,
    });
  }
  return Users;
};
