const Sequelize = require('sequelize');
const dbClient = require('../client');

const {
  findBySchoolAndSession,
  findAllByFullName,
} = require('./methods');

const Sessions = dbClient.define('sessions', {
  content: {
    allowNull: true,
    defaultValue: '',
    type: Sequelize.TEXT,
  },
  // milliseconds
  duration: {
    allowNull: false,
    type: Sequelize.INTEGER,
  },
  endTime: {
    allowNull: true,
    type: Sequelize.DATE,
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
  password: {
    allowNull: true,
    type: Sequelize.STRING,
  },
  schoolName: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  sessionName: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  status: {
    allowNull: false,
    type: Sequelize.STRING,
  },
}, {
  freezeTableName: true,
  timestamps: true,
});

// class methods
Sessions.findBySchoolAndSession = findBySchoolAndSession;
Sessions.findAllByFullName = findAllByFullName;

Sessions.CONTENT = 'content';
Sessions.CREATED_AT = 'createdAt';
Sessions.CURRENT_INTERVAL_ID = 'currentIntervalId';
Sessions.DURATION = 'duration';
Sessions.END_TIME = 'endTime';
Sessions.ID = 'id';
Sessions.OWNER_ID = 'ownerId';
Sessions.PARTICIPANTS = 'participants';
Sessions.PASSWORD = 'password';
Sessions.SCHOOL_NAME = 'schoolName';
Sessions.SESSION_NAME = 'sessionName';
Sessions.STATUS = 'status';
Sessions.UPDATED_AT = 'updatedAt';

Sessions.STATUS_CREATED = 'created';
Sessions.STATUS_WAITING = 'waiting';
Sessions.STATUS_ACTIVE = 'active';
Sessions.STATUS_ENDED = 'ended';

module.exports = Sessions;
