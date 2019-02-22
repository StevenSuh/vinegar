<template>
  <div class="control">
    <div class="interval-wrapper marginTop" v-if="isInterval">
      <div class="interval-text">
        <p class="bold">Turn ending in:</p>
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
      endTime: null || Date.now() + (1000 * 60 * 60 * 2),
      intervalUser: null || 'Steven',
      isOwner: null,
      participants: null,
      status: null,

      // isInterval
      isInterval: null,
      intervalEndTime: null || Date.now() + (1000 * 60 * 60 * 2),
      remaining: Math.floor((this.intervalEndTime - Date.now()) / 1000),
      intervalStartTime: null,
      targetTimestamp: 0,
    };
  },
  mounted() {
    this.onIsInterval();
  },
  methods: {
    formatDuration,
    onCountEndTime(timestamp) {
      const remaining = this.intervalEndTime - this.intervalStartTime - timestamp;
      const timeout = 1000 + (this.targetTimestamp - timestamp);

      this.remaining = Math.floor(remaining / 1000);
      this.targetTimestamp = timestamp + timeout;

      if (this.remaining > 0) {
        setTimeout(window.requestAnimationFrame, timeout, this.onCountEndTime);
      }
    },
    onIsInterval() {
      if (this.isInterval) {
        this.intervalStartTime = Date.now();
        this.remaining = Math.floor((this.intervalEndTime - this.intervalStartTime) / 1000);
        window.requestAnimationFrame(this.onCountEndTime);
      }
    },
  },
  sockets: {
    'socket:onEnter': function({ duration, isOwner, participants, status }) {
      this.duration = duration;
      this.isOwner = isOwner;
      this.participants = participants;
      this.status = status;
    },
    'control:onUpdateStatus': function({ participants, status }) {
      this.participants = participants;
      this.status = status;
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
