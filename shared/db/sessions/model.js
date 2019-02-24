const Sequelize = require('sequelize');
const {
  findBySchoolAndSession,
  findAllByFullName,
} = require('./methods');

const STATUS = ['initial', 'waiting', 'active', 'ended'];
let Sessions = null;

module.exports = (dbClient) => {
  if (!Sessions) {
    Sessions = dbClient.define('sessions', {
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
        default: STATUS[0],
        type: Sequelize.STRING,
        validate: {
          isOneOf(value) {
            if (!STATUS.includes(value)) {
              throw new Error(`${value} must be one of ${STATUS}`);
            }
          },
        }
      },
    }, {
      freezeTableName: true,
      timestamps: true,
    });

    // class methods
    Sessions.findBySchoolAndSession = findBySchoolAndSession;
    Sessions.findAllByFullName = findAllByFullName;

    // class definitions
    Sessions.CONTENT = 'content';
    Sessions.CREATED_AT = 'createdAt';
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

    Sessions.STATUS_INITIAL = 'initial';
    Sessions.STATUS_WAITING = 'waiting';
    Sessions.STATUS_ACTIVE = 'active';
    Sessions.STATUS_ENDED = 'active';
  }
  return Sessions;
};
