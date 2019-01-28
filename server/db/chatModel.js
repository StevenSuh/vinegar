const Sequelize = require('sequelize');

let chatModel = null;

module.exports = (dbClient) => {
  if (!chatModel) {
    chatModel = dbClient.define('chats', {
      message: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.STRING,

      },
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      // userID sequelize string


    }, {
      freezeTableName: true,
      timestamps: true,
    });
  }
  return chatModel;
};
