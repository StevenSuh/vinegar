const dbClient = require('db')();
const Intervals = require('db/intervals/model')(dbClient);
const IntervalManagers = require('db/intervalManagers/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const redisClient = require('services/redis')();

const {
  CONTROL_IS_INTERVAL,
  CONTROL_UPDATE_STATUS,
  INTERVAL_REMIND,
  INTERVAL_STATUS,
  INTERVAL_UPDATE,
  SOCKET_CLOSE,
} = require('routes/socket/defs');

class Interval {
  constructor({ session, redisClient, publisher }) {
    this.ended = false;

    this.count = session.get(Sessions.PARTICIPANTS);
    this.intervals = [];
    this.intervalUsers = [];
    this.intervalTimeout = null;
    this.current = 0;
    this.timestamp = null;
    this.targetTimestamp = null;

    this.totalDuration = session.get(Sessions.DURATION);
    this.timeout = this.normalizeTimeout();
    this.endTime = session.get(Sessions.END_TIME);

    this.redisClient = redisClient;
    this.publisher = publisher;

    this.session = session;
    this.sessionId = session.get(Sessions.ID);
    this.sessionName = `session-${this.sessionId}`;

    this.intervalManager = IntervalManagers.create({
      sessionId: this.sessionId,
    });
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
    return a;
  }

  async setupInterval() {
    const people = await this.session.getUsers({ where: { active: true }});
    this.intervalUsers = this.shuffle(people);

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

      if (i > 0) {
        const userIdName = `user-${user.get(Users.USER_ID)}`;
        this.publisher.to(userIdName).publishEvent(INTERVAL_STATUS, { startTime });
      }
    }

    this.intervals = await Promise.all(promises);
  }

  startInterval(timeout) {
    const now = Date.now();
    const currentInterval = this.intervals[this.current];

    const userIdName = `user-${currentInterval.get(Intervals.USER_ID)}`;
    this.publisher.to(userIdName).publishEvent(CONTROL_IS_INTERVAL);

    this.publisher.to(this.sessionName).publishEvent(INTERVAL_UPDATE, {
      intervalUser: currentInterval.get(Intervals.USERNAME),
      intervalStartTime: currentInterval.get(Intervals.START_TIME),
      intervalEndTime: currentInterval.get(Intervals.END_TIME),
    });

    if (this.current < this.count - 1) {
      const expectedTimestamp = (this.timestamp || now) + this.timeout;
      const remaining = expectedTimestamp - now;
      const timeoutDuration = (timeout || this.timeout + remaining);

      this.current += 1;
      this.timestamp = now;
      this.targetTimestamp = now + timeoutDuration;

      this.intervalTimeout = setTimeout(this.startInterval, timeoutDuration);
    } else {
      this.endInterval();
    }
  }

  endInterval() {
    this.ended = true;
    this.publisher.to(this.sessionName).publishEvent(
      CONTROL_UPDATE_STATUS,
      { status: Sessions.STATUS_ENDED },
    );

    setTimeout(() => {
      this.publisher.to(this.sessionName).publishEvent(INTERVAL_REMIND);
      setTimeout(() => {
        const schoolQuery = redisClient.sessionSchool({ sessionId: this.sessionId });
        const sessionQuery = redisClient.sessionName({ sessionId: this.sessionId });
        redisClient.delAsync(schoolQuery[0], sessionQuery[0]);

        this.session.remove();
        this.publisher.to(this.sessionName).publishServer(SOCKET_CLOSE);
      }, 60000 * 5);
    }, 60000 * 5);
  }

  async reassignInterval(userId) {
    if (this.targetTimestamp - Date.now() < 60000) {
      return;
    }

    const user = Users.findOne({ where: { id: userId }});
    if (user) {
      setTimeout(async () => {
        await user.reload();
        if (user.get(Users.ACTIVE)) {
          return;
        }

        const userId = user.get(Users.ID);
        const targetIndex = this.intervals.findIndex(interval =>
          userId === interval.get(Intervals.USER_ID));

        if (targetIndex !== -1) {
          const candidate = await this.getRandomCandidate();

          if (candidate) {
            const interval = this.intervals[targetIndex];

            await interval.update({ userId: candidate.get(Users.ID) });

            if (targetIndex === this.current) {
              const diff = this.targetTimestamp - Date.now();

              clearTimeout(this.intervalTimeout);
              this.startInterval(diff);
            } else {
              const userIdName = `user-${userId}`;
              this.publisher.to(userIdName).publishEvent(
                INTERVAL_STATUS,
                { startTime: interval.get(Intervals.START_TIME) },
              );
            }
          }
        }
      }, 30000);
    }
  }

  async getRandomCandidate() {
    const people = await this.session.getUsers({ where: { active: true }});

    let intervals = (people.length > this.count) ?
      this.intervals :
      this.intervals.slice(0, this.current + 1);

    const candidates = people.filter(person =>
      !intervals.find(interval => interval.get(Intervals.USER_ID) === person.get(Users.ID)));

    return this.shuffle(candidates)[0];
  }
}

module.exports = {
  Interval,
};
