<template>
  <div class="control">
    <div v-if="isInterval">
      IsInterval
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
      :interval-name="intervalName"
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
      intervalName: null,
      intervalEndTime: null,
      isInterval: null,
      isOwner: null,
      participants: null,
      status: null,
    };
  },
  sockets: {
    'socket:onEnter': function({ duration, isOwner, participants, status }) {
      this.duration = duration;
      this.isOwner = isOwner;
      this.participants = participants;
      this.status = status;
    },
    'control:onUpdate': function({ participants, status }) {
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
</style>
