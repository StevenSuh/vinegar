const schedule = require('node-schedule');

const logger = require('services/logger');

const Sessions = require('db/sessions/model');
const Users = require('db/users/model');

module.exports = {
  cleanupJob: () => {
    schedule.scheduleJob(
      '0 0 0 * * 0', // 00:00:00 every Sunday
      () => {
        Users.destroy({
          where: {
            active: false,
            updatedAt: {
              $lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // older than 1 week
            },
          },
        });

        Sessions.destroy({
          where: {
            status: [
              Sessions.STATUS_CREATED,
              Sessions.STATUS_WAITING,
              Sessions.STATUS_ENDED,
            ],
            updatedAt: {
              $lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // older than 1 week
            },
          },
        });
      },
    );
  },
  sleep: timeout => new Promise(resolve => setTimeout(resolve, timeout)),
  tryCatch: (fn, errCb) => {
    try {
      return fn();
    } catch (err) {
      if (errCb) {
        return errCb();
      }
      logger.warn(err);
      return null;
    }
  },
};
