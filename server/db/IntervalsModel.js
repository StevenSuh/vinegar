const Sequelize = require('sequelize');

let Intervals = null;

module.exports = (dbClient) => {
  if (Intervals) {
    Intervals = dbClient.define('intervals', {
      active: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      downvote: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      upvote: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      // userId,
      // roomId,
    }, {
      freezeTableName: true,
      timestamps: true,
    });
  }
  
  return Intervals;
};
