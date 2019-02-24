const Sequelize = require('sequelize');

let Intervals = null;

module.exports = (dbClient) => {
  if (!Intervals) {
    Intervals = dbClient.define('intervals', {
      active: {
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      downvote: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      upvote: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      duration: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      startTime: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      endTime: {
        allowNull: false,
        type: Sequelize.STRING,
      },
    }, {
      freezeTableName: true,
      timestamps: true,
    });

    // class definitions
    Intervals.ACTIVE = 'active';
    Intervals.CREATED_AT = 'createdAt';
    Intervals.DOWNVOTE = 'downvote';
    Intervals.ID = 'id';
    Intervals.UPVOTE = 'upvote';
    Intervals.UPDATED_AT = 'updatedAt';
    Intervals.USERNAME = 'username';
    Intervals.USER_ID = 'userId';
    Intervals.START_TIME = 'startTime';
    Intervals.END_TIME = 'endTime';
  }
  return Intervals;
};
