// TODO: use node-schedule
// https://github.com/node-schedule/node-schedule#readme
const dbClient = require('db')();
const Intervals = require('db/intervals/model')(dbClient);
const IntervalManagers = require('db/intervalManagers/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const { redisClient } = require('services/redis');

const {
  SESSION_END_DURATION,
  CONTROL_INTERVAL,
  CONTROL_UPDATE_STATUS,
  INTERVAL_REMIND,
  INTERVAL_STATUS,
  INTERVAL_UPDATE,
  SOCKET_CLOSE,
} = require('defs');

const { sleep } = require('utils');

class Interval {
  constructor({ session, publisher }, managers) {
    this.managers = managers;
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

    this.publisher = publisher;

    this.session = session;
    this.sessionId = session.get(Sessions.ID);
    this.sessionName = `session-${this.sessionId}`;

    this.intervalManager = null;
    this.managerId = null
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

  async findUserInInterval(userId, fromStart) {
    for (
      let i = fromStart ? 0 : this.current;
      i < this.intervals.length;
      i += 1
    ) {
      const interval = this.intervals[i];

      if (interval.get(Intervals.USER_ID) === userId) {
        const user = await Users.findOne({ where: { id: userId } });
        return user;
      }
    }
    return null;
  }

  notifyUser(interval, isInterval) {
    const userIdName = `user-${interval.get(Intervals.USER_ID)}`;
    this.publisher.to(userIdName).publishEvent(CONTROL_INTERVAL, {
      isInterval,
      intervalEndTime: interval.get(Intervals.END_TIME),
    });
  }

  async setupInterval() {
    this.intervalManager = await IntervalManagers.create({ sessionId: this.sessionId });
    this.managerId = this.intervalManager.get(IntervalManagers.ID);

    const people = await this.session.getUsers({ where: { active: true }});
    this.intervalUsers = this.shuffle(people);

    const promises = [];

    for (let i = 0; i < this.count; i += 1) {
      const user = this.intervalUsers[i];
      const startTime = this.endTime - ((this.count - i) * this.timeout);

      promises.push(Intervals.create({
        duration: this.timeout,
        intervalManagerId: this.managerId,
        sessionId: this.sessionId,
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

  async startInterval(timeout, initial) {
    const currentInterval = this.intervals[this.current];
    await this.session.update({ currentIntervalId: currentInterval.get(Intervals.ID) });

    // update current user view
    this.notifyUser(currentInterval, true);

    if (!initial) {
      // reset previous user view
      const prevInterval = this.intervals[this.current - 1];
      this.notifyUser(prevInterval, false);
    }

    this.publisher.to(this.sessionName).publishEvent(INTERVAL_UPDATE, {
      intervalUser: currentInterval.get(Intervals.USERNAME),
    });

    if (initial) {
      this.publisher.to(this.sessionName).publishEvent(CONTROL_UPDATE_STATUS, {
        endTime: this.session.get(Sessions.END_TIME),
        status: this.session.get(Sessions.STATUS),
      });
    }
    console.log(`${this.current  }:`, currentInterval.get(), initial, this.count - 1);

    const now = Date.now();
    const expectedTimestamp = this.timestamp ? this.timestamp + this.timeout : now;
    const remaining = expectedTimestamp - now;
    const timeoutDuration = (timeout || this.timeout + remaining);

    console.log(this.count - 1, (timeout || this.timeout + remaining));

    this.timestamp = now;
    this.targetTimestamp = now + timeoutDuration;

    if (this.current < this.count - 1) {
      this.current += 1;
      this.intervalTimeout = setTimeout(this.startInterval.bind(this), timeoutDuration);
    } else {
      this.intervalTimeout = setTimeout(this.endInterval.bind(this), timeoutDuration);
    }
  }

  async endInterval() {
    this.ended = true;
    await this.session.update({ status: Sessions.STATUS_ENDED });
    this.publisher.to(this.sessionName).publishEvent(
      CONTROL_UPDATE_STATUS,
      { status: Sessions.STATUS_ENDED },
    );

    // warning
    await sleep(SESSION_END_DURATION);
    this.publisher.to(this.sessionName).publishEvent(INTERVAL_REMIND);
    console.log('SOCKET CLOSING SOON!!!!!!!!!!!!!!!!!!!!');

    // terminate session
    await sleep(SESSION_END_DURATION);
    const schoolQuery = redisClient.sessionSchool({ sessionId: this.sessionId });
    const sessionQuery = redisClient.sessionName({ sessionId: this.sessionId });
    redisClient.delAsync(schoolQuery[0], sessionQuery[0]);

    delete this.managers[this.managerId];
    this.session.destroy();

    this.publisher.to(this.sessionName).publishServer(SOCKET_CLOSE);
    console.log('SOCKET CLOSED!!!!!!!!!!!!!!!!!!!!');
  }

  async reassignInterval(userId) {
    if (this.ended) {
      return;
    }

    // if ending soon, cancel reassignment
    if (this.targetTimestamp - Date.now() < 60000) {
      return;
    }

    const user = await this.findUserInInterval(userId);
    if (!user) {
      return;
    }

    // leaway for accidental close
    await sleep(30000);
    await user.reload();
    if (user.get(Users.ACTIVE)) {
      return;
    }

    const targetIndex = this.intervals.findIndex(interval =>
      userId === interval.get(Intervals.USER_ID));

    const candidate = await this.getRandomCandidate();
    if (!candidate) {
      return;
    }

    const interval = this.intervals[targetIndex];
    await interval.update({ userId: candidate.get(Users.ID) });

    if (targetIndex === this.current) {
      const diff = this.targetTimestamp - Date.now();

      clearTimeout(this.intervalTimeout);
      await this.startInterval(diff);
    } else {
      const userIdName = `user-${userId}`;
      this.publisher.to(userIdName).publishEvent(
        INTERVAL_STATUS,
        { startTime: interval.get(Intervals.START_TIME) },
      );
    }
  }

  async getRandomCandidate() {
    const people = await this.session.getUsers({ where: { active: true }});

    const intervals = (people.length > this.count) ?
      this.intervals :
      this.intervals.slice(0, this.current + 1);

    const candidates = people.filter(person =>
      !intervals.find(interval => interval.get(Intervals.USER_ID) === person.get(Users.ID)));

    return this.shuffle(candidates)[0];
  }
}

module.exports = Interval;
