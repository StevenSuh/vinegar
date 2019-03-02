const schedule = require('node-schedule');

const dbClient = require('db')();
const Intervals = require('db/intervals/model')(dbClient);
const IntervalManagers = require('db/intervalManagers/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const { getRoundRobinId, redisClient } = require('services/redis');

const {
  SESSION_END_DURATION,
  CONTROL_INTERVAL,
  CONTROL_UPDATE_STATUS,
  INTERVAL_REMIND,
  INTERVAL_STATUS,
  INTERVAL_UPDATE,
  REASSIGN_WAIT_DURATION,
  SOCKET_CLOSE,
} = require('defs');

const { sleep } = require('utils');

class Interval {
  constructor({ session, publisher }, managers) {
    this.managers = managers;
    this.ended = false;

    this.current = -1;
    this.count = session.get(Sessions.PARTICIPANTS);
    this.jobs = [];
    this.intervals = [];
    this.intervalUsers = [];

    this.totalDuration = session.get(Sessions.DURATION);
    this.timeout = this.normalizeTimeout();
    this.endTime = session.get(Sessions.END_TIME);

    this.publisher = publisher;

    this.session = session;
    this.sessionId = session.get(Sessions.ID);
    this.sessionName = `session-${this.sessionId}`;

    this.manager = null;
    this.managerId = null;
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

  notifyUser(interval, isInterval) {
    const userIdName = `user-${interval.get(Intervals.USER_ID)}`;
    this.publisher.to(userIdName).publishEvent(CONTROL_INTERVAL, {
      isInterval,
      intervalEndTime: interval.get(Intervals.END_TIME),
    });
  }

  async setupExisting(manager) {
    this.manager = manager;
    this.managerId = manager.get(IntervalManagers.ID);

    if (this.session.get(Sessions.STATUS) === Sessions.STATUS_ENDED) {
      this.endInterval();
      return;
    }

    await redisClient.setAsync(redisClient.robinQuery(
      { managerId: this.managerId },
      await getRoundRobinId(),
    ));

    this.intervals = await this.manager.getIntervals();

    const currentIntervalId = this.session.get(Sessions.CURRENT_INTERVAL_ID);
    const currentInterval = this.intervals.findIndex(interval =>
      currentIntervalId === interval.get(Intervals.ID));
    this.current = currentInterval;

    const jobs = [];

    for (let i = currentInterval + 1; i < this.intervals.length; i += 1) {
      const startTime = this.intervals[i].get(Intervals.START_TIME);
      jobs.push(schedule.scheduleJob(
        new Date(startTime),
        () => this.startInterval(),
      ));
    }

    jobs.push(schedule.scheduleJob(
      new Date(this.endTime),
      () => this.endInterval(),
    ));

    this.jobs = jobs;

    this.startInterval(true);
  }

  async setupInterval() {
    this.current = -1;

    const manager = await this.session.getManager();
    if (manager) {
      this.setupExisting(manager);
      return;
    }

    // create manager
    this.manager = await IntervalManagers.create({ sessionId: this.sessionId });
    this.managerId = this.manager.get(IntervalManagers.ID);

    await redisClient.setAsync(redisClient.robinQuery(
      { managerId: this.managerId },
      await getRoundRobinId(),
    ));

    // shuffle people
    const people = await this.session.getUsers({ where: { active: true }});
    this.intervalUsers = this.shuffle(people);

    const jobs = [];
    const promises = [];

    // create jobs and intervals
    for (let i = 0; i < this.count; i += 1) {
      const initial = i === 0;
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

      if (!initial) {
        jobs.push(schedule.scheduleJob(
          new Date(startTime),
          () => this.startInterval(),
        ));

        const userIdName = `user-${user.get(Users.USER_ID)}`;
        this.publisher.to(userIdName).publishEvent(INTERVAL_STATUS, { startTime });
      }
    }

    jobs.push(schedule.scheduleJob(
      new Date(this.endTime),
      () => this.endInterval(),
    ));

    this.jobs = jobs;
    this.intervals = await Promise.all(promises);

    this.startInterval(true);
  }

  async startInterval(initial) {
    this.current += 1;

    const currentInterval = this.intervals[this.current];
    await this.session.update({ currentIntervalId: currentInterval.get(Intervals.ID) });

    // update current user view
    this.notifyUser(currentInterval, true);

    this.publisher.to(this.sessionName).publishEvent(INTERVAL_UPDATE, {
      intervalUser: currentInterval.get(Intervals.USERNAME),
    });

    if (this.current > 0) {
      // reset previous user view
      const prevInterval = this.intervals[this.current - 1];
      this.notifyUser(prevInterval, false);
    }

    if (initial) {
      this.publisher.to(this.sessionName).publishEvent(CONTROL_UPDATE_STATUS, {
        endTime: this.session.get(Sessions.END_TIME),
        status: this.session.get(Sessions.STATUS),
      });
    }
  }

  async endInterval() {
    // session has ended
    this.ended = true;
    await this.session.update({ status: Sessions.STATUS_ENDED });
    this.publisher.to(this.sessionName).publishEvent(
      CONTROL_UPDATE_STATUS,
      { status: Sessions.STATUS_ENDED },
    );

    // warning before session is terminated
    await sleep(SESSION_END_DURATION);
    const ownerIdName = `user-${this.session.get(Sessions.OWNER_ID)}`;
    this.publisher.to(ownerIdName).publishServer(INTERVAL_REMIND);

    // terminate session
    await sleep(SESSION_END_DURATION);
    const robinQuery = redisClient.robinQuery({ managerId: this.managerId });
    const schoolQuery = redisClient.sessionSchool({ sessionId: this.sessionId });
    const sessionQuery = redisClient.sessionName({ sessionId: this.sessionId });
    redisClient.delAsync(schoolQuery[0], sessionQuery[0], robinQuery);

    delete this.managers[this.managerId];
    this.session.destroy();
    this.publisher.to(this.sessionName).publishServer(SOCKET_CLOSE);
  }

  /**
   * Reassigns the user's interval if:
   *  - session is active
   *  - user has an interval
   *  - user is inactive (has left the session)
   *  - user's interval is about to end
   * @param {string} userId - id of user in session
   */
  async reassignInterval(userId) {
    const targetIndex = this.intervals.findIndex(interval =>
      userId === interval.get(Intervals.USER_ID));

    if (this.ended || targetIndex === -1) {
      return;
    }

    const interval = this.intervals[targetIndex];
    if (interval.get(Intervals.END_TIME) - Date.now() < 60000) {
      return;
    }

    // leaway for accidental close
    await sleep(REASSIGN_WAIT_DURATION);
    const user = await Users.findOne({ where: { id: userId }});
    if (user.get(Users.ACTIVE)) {
      return;
    }

    const candidate = await this.getRandomCandidate();
    if (!candidate) {
      return;
    }

    await interval.update({
      userId: candidate.get(Users.ID),
      username: candidate.get(Users.NAME),
    });

    if (targetIndex === this.current) {
      this.current -= 1;
      this.startInterval();
    } else {
      const userIdName = `user-${candidate.get(Users.ID)}`;
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
      this.intervals.slice(this.current);

    const candidates = people.filter(person =>
      !intervals.find(interval =>
        interval.get(Intervals.USER_ID) === person.get(Users.ID)));

    return this.shuffle(candidates)[0];
  }
}

module.exports = Interval;
