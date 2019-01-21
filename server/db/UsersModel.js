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
        unique: true,
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
      sessionId: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      // roomId,
    }, {
      freezeTableName: true,
      timestamps: true,
    });
  }
  return Users;
};
