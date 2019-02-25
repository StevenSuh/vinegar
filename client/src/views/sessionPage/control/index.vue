<template>
  <div class="control">
    <div
      v-if="isInterval"
      class="interval-wrapper marginTop"
    >
      <div class="interval-text">
        <p class="bold">
          Turn ending in:
        </p>
        <p>{{ formatDuration(remaining) }}</p>
      </div>
    </div>
    <Initial
      v-else-if="status === 'initial'"
      :duration="duration"
      :is-owner="isOwner"
      :socket="socket"
    />
    <Waiting
      v-else-if="status === 'waiting'"
      :duration="duration"
      :participants="participants"
    />
    <Active
      v-else-if="status === 'active'"
      :end-time="endTime"
      :interval-user="intervalUser"
      :is-owner="isOwner"
      :socket="socket"
    />
  </div>
</template>

<script>
import Active from './active';
import Initial from './initial';
import Waiting from './waiting';

import { socketMixin } from '@/services/socket';

import { formatDuration } from './utils';

export default {
  components: {
    Active,
    Initial,
    Waiting,
  },
  mixins: [socketMixin],
  props: {
    socket: [Object, WebSocket],
  },
  data() {
    return {
      duration: null,
      endTime: null,
      intervalUser: null,
      isOwner: null,
      participants: null,
      status: null,

      // isInterval
      requestStartTime: null,
      isInterval: null,
      intervalEndTime: null,
      remaining: null,
      intervalStartTime: null,
      targetTimestamp: 0,

      // requestAnimationFrame id
      countEndTimeId: null,
    };
  },
  beforeDestroy() {
    if (this.countEndTimeId) {
      window.cancelAnimationFrame(this.countEndTimeId);
    }
  },
  methods: {
    formatDuration,
    onCountEndTime(timestamp) {
      if (!this.requestStartTime) {
        this.requestStartTime = timestamp;
      }
      const actualTimestamp = timestamp - this.requestStartTime;

      const timeout = 1000 + (this.targetTimestamp - actualTimestamp);
      this.remaining =
        this.intervalEndTime - this.intervalStartTime - actualTimestamp;
      this.targetTimestamp = actualTimestamp + timeout;

      if (this.remaining > 0) {
        setTimeout(() => {
          this.countEndTimeId = window.requestAnimationFrame(
            this.onCountEndTime,
          );
        }, timeout);
      } else {
        this.remaining = 0;
        this.countEndTimeId = null;
      }
    },
    onIsInterval() {
      if (this.isInterval && this.intervalEndTime) {
        this.intervalStartTime = Date.now();
        this.remaining = this.intervalEndTime - this.intervalStartTime;
        this.countEndTimeId = window.requestAnimationFrame(this.onCountEndTime);
      }
    },
  },
  sockets: {
    'control:onEnter': function({
      duration,
      endTime,
      intervalUser,
      isOwner,
      participants,
      status,
    }) {
      this.duration = duration;
      this.endTime = new Date(endTime).getTime();
      this.intervalUser = intervalUser;
      this.isOwner = isOwner;
      this.participants = participants;
      this.status = status;
    },
    'control:onInterval': function({ isInterval, intervalEndTime }) {
      console.log(isInterval, intervalEndTime);
      this.isInterval = isInterval;
      this.intervalEndTime = new Date(intervalEndTime).getTime();
      this.onIsInterval();
    },
    'control:onUpdateStatus': function({ endTime, participants, status }) {
      if (endTime) {
        this.endTime = new Date(endTime).getTime();
      }
      this.participants = participants;
      this.status = status;
    },
    'interval:onUpdate': function({ intervalUser }) {
      this.intervalUser = intervalUser;
    },
  },
};
</script>

<style scoped>
.control {
  display: flex;
}

.interval-wrapper {
  width: 100%;
}

.interval-text {
  font-size: 18px;
  text-align: center;
}

.bold {
  color: var(--main-font-color);
  font-weight: 500;
  margin-bottom: 15px;
}
</style>
