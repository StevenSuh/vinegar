<template>
  <div class="control">
    <Ended
      v-if="status === 'ended'"
      :socket="socket"
    />
    <IsInterval
      v-else-if="isInterval"
      :is-interval="isInterval"
      :interval-end-time="intervalEndTime"
    />
    <Initial
      v-else-if="status === 'created'"
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
import Active from './modules/active';
import Ended from './modules/ended';
import Initial from './modules/initial';
import IsInterval from './modules/isInterval';
import Waiting from './modules/waiting';

import { socketMixin } from '@/services/socket';

export default {
  components: {
    Active,
    Ended,
    Initial,
    IsInterval,
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
      isInterval: null,
      intervalEndTime: null,
    };
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
      this.isInterval = isInterval;
      this.intervalEndTime = new Date(intervalEndTime).getTime();
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
</style>
