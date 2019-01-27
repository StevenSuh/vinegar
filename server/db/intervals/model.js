const Sequelize = require('sequelize');

let Intervals = null;

module.exports = (dbClient) => {
  if (!Intervals) {
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
  }
  return Intervals;
};
