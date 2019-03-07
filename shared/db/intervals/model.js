const Sequelize = require('sequelize');
const dbClient = require('../client');

const Intervals = dbClient.define('intervals', {
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
    type: Sequelize.DATE,
  },
  endTime: {
    allowNull: false,
    type: Sequelize.DATE,
  },
}, {
  freezeTableName: true,
  timestamps: true,
});

// class definitions
Intervals.CREATED_AT = 'createdAt';
Intervals.DOWNVOTE = 'downvote';
Intervals.ID = 'id';
Intervals.UPVOTE = 'upvote';
Intervals.UPDATED_AT = 'updatedAt';
Intervals.USERNAME = 'username';
Intervals.USER_ID = 'userId';
Intervals.START_TIME = 'startTime';
Intervals.END_TIME = 'endTime';

module.exports = Intervals;
