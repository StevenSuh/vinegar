const dbClient = require('db')();
const Intervals = require('db/intervals/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const redisClient = require('services/redis')();

const { getPeople } = require('routes/socket/utils');

const {
  CONTROL_IS_INTERVAL,
  CONTROL_UPDATE_STATUS,
  INTERVAL_REMIND,
  INTERVAL_UPDATE,
} = require('routes/socket/defs');

class Interval {
  constructor({ people, session, wss, ws }) {
    this.ended = false;

    this.count = session.get(Sessions.PARTICIPANTS);
    this.people = people;
    this.intervals = [];
    this.intervalUsers = [];
    this.intervalTimeout = null;
    this.current = 0;

    this.totalDuration = session.get(Sessions.DURATION);
    this.timeout = this.normalizeTimeout();
    this.endTime = session.get(Sessions.END_TIME);

    this.wss = wss;
    this.ws = ws;

    this.session = session;
    this.sessionId = session.get(Sessions.ID);
    this.sessionName = `session-${this.sessionId}`;
  }

  normalizeTimeout() {
    const rawTimeout = this.totalDuration / this.count;
    const normalizedTimeout = Math.max(rawTimeout, 60000);

    if (normalizedTimeout !== rawTimeout) {
      this.count = Math.min(this.count, this.totalDuration / 60000);
    }

    return normalizedTimeout;
  }

  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
        const randIdx = Math.floor(Math.random() * (i + 1));
        const temp = a[i];
        a[i] = a[randIdx];
        a[randIdx] = temp;
    }
    this.intervalUsers = a;
  }

  async reshuffle() {
    this.people = await getPeople(this.sessionId);

    let newUsers = this.people;
    if (newUsers.length > this.count) {
      newUsers = this.people.filter(person =>
        !this.intervals.find(interval =>
          interval.get(Intervals.USER_ID) === person.get(Users.ID)));
    }
  }

  async setupInterval() {
    this.shuffle(this.people);
    const promises = [];

    for (let i = 0; i < this.count; i += 1) {
      const user = this.intervalUsers[i];
      const startTime = this.endTime - ((this.count - i) * this.timeout);

      promises.push(Intervals.create({
        active: i === 0,
        duration: this.timeout,
        startTime,
        endTime: startTime + this.timeout,
        username: user.get(Users.NAME),
        userId: user.get(Users.ID),
      }));
    }

    this.intervals = await Promise.all(promises);
  }

  startInterval(timeout) {
    const now = Date.now();
    const currentInterval = this.intervals[this.current];

    const userIdName = `user-${currentInterval.get(Intervals.USER_ID)}`;
    this.wss.to(userIdName).sendServer(CONTROL_IS_INTERVAL);

    this.wss.to(this.sessionName).sendEvent(INTERVAL_UPDATE, {
      intervalUser: currentInterval.get(Intervals.USERNAME),
      intervalStartTime: currentInterval.get(Intervals.START_TIME),
      intervalEndTime: currentInterval.get(Intervals.END_TIME),
    });

    if (this.current < this.count - 1) {
      const expectedTimestamp = this.timestamp + this.timeout;
      const remaining = expectedTimestamp - now;

      this.current += 1;
      this.timestamp = now;
      this.intervalTimeout = setTimeout(this.startInterval,
        timeout || this.timeout + remaining);
    } else {
      this.endInterval();
    }
  }

  endInterval() {
    this.ended = true;
    this.wss.to(this.sessionName).sendEvent(CONTROL_UPDATE_STATUS,
      { status: Sessions.STATUS_ENDED });

    setTimeout(() => {
      this.wss.to(this.sessionName).sendEvent(INTERVAL_REMIND);
      setTimeout(() => {
        const schoolQuery = redisClient.sessionSchool({ sessionId: this.sessionId });
        const sessionQuery = redisClient.sessionName({ sessionId: this.sessionId });
        redisClient.delAsync(schoolQuery[0], sessionQuery[0]);

        this.session.remove();
        this.ws.close();
      }, 60000 * 5);
    }, 60000 * 5);
  }

  reassignInterval(user) {
    setTimeout(async () => {
      await user.reload();

      // give 30 seconds of leaway til relogin
      if (!user.get(Users.ACTIVE)) {
        const userId = user.get(Users.ID);
        const targetIndex = this.intervals.findIndex(interval =>
          userId === interval.get(Intervals.USER_ID));

        if (targetIndex !== -1) {
          const interval = this.intervals[targetIndex];
          const intervalId = interval.get(Intervals.ID);
          const isCurrent = targetIndex === this.current;

          const newUserId = this.reshuffle();

          if (isCurrent) {
            // need to cancel this.intervalTimeout and redo it

            // const userIdName = `user-${currentInterval.get(Intervals.USER_ID)}`;
            // this.wss.to(userIdName).sendServer(CONTROL_IS_INTERVAL);

            // this.wss.to(this.sessionName).sendEvent(INTERVAL_UPDATE, {
            //   intervalUser: currentInterval.get(Intervals.USERNAME),
            //   intervalStartTime: currentInterval.get(Intervals.START_TIME),
            //   intervalEndTime: currentInterval.get(Intervals.END_TIME),
            // });
            this.wss.to(this.sessionName).sendEvent()
          }
        }
      }
    }, 30000);
  }
}

module.exports = async (session, people, wss, ws) => {
  const interval = new Interval({ session, people, wss, ws});

  await interval.setupInterval();
  interval.startInterval();

  return interval;
};
