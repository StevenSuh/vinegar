const Sequelize = require('sequelize');
const {
  getFullName,
  searchFullName,
} = require('./methods');

let Sessions = null;

module.exports = (dbClient) => {
  if (!Sessions) {
    Sessions = dbClient.define('sessions', {
      active: {
        allowNull: true,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      content: {
        allowNull: true,
        defaultValue: '',
        type: Sequelize.TEXT,
      },
      // minutes
      duration: {
        allowNull: true,
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
    }, {
      getterMethods: {
        getFullName,
      },
      freezeTableName: true,
      timestamps: true,
    });

    // class methods
    Sessions.searchFullName = searchFullName;

    // class definitions
    Sessions.ACTIVE = 'active';
    Sessions.CONTENT = 'content';
    Sessions.CREATED_AT = 'createdAt';
    Sessions.DURATION = 'duration';
    Sessions.ID = 'id';
    Sessions.PARTICIPANTS = 'participants';
    Sessions.SCHOOL_NAME = 'schoolName';
    Sessions.SESSION_NAME = 'sessionName';
    Sessions.UPDATED_AT = 'updatedAt';
  }
  return Sessions;
};
