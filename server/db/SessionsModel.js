const Sequelize = require('sequelize');

let Sessions = null;

module.exports = (dbClient) => {
  if (!Sessions) {
    Sessions = dbClient.define('sessions', {
      active: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      content: {
        allowNull: false,
        defaultValue: '',
        type: Sequelize.TEXT,
      },
      // minutes
      duration: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      participants: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      schoolName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      sessionName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      // ownerId
    }, {
      freezeTableName: true,
      timestamps: true,
    });
  }
  return Sessions;
};
