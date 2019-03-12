<template>
  <div class="headline-wrapper">
    <transition name="upDown">
      <p v-if="startTime">
        <span class="you bold"> You </span>
        <span>{{ ' are coming at ' }}</span>
        <span class="bold"> {{ formatDate(startTime) }} </span>
      </p>
    </transition>
    <Help
      class="help-button"
      :socket="socket"
    />
  </div>
</template>

<script>
import { socketMixin } from '@/services/socket';

import Help from './helpModal';

export default {
  components: {
    Help,
  },
  mixins: [socketMixin],
  props: {
    socket: [Object, WebSocket],
  },
  data() {
    return {
      startTime: null,
    };
  },
  methods: {
    formatDate(value) {
      const localDate = new Date(value);
      let hour = localDate.getHours();
      let minute = localDate.getMinutes();

      minute = minute < 10 ? `0${minute}` : minute;
      const amPm = hour < 12 ? 'AM' : 'PM';
      hour = hour % 12 ? hour % 12 : 12;

      return `${hour}:${minute} ${amPm}`;
    },
  },
  sockets: {
    'control:onIsInterval': function({ isInterval }) {
      if (isInterval) {
        this.startTime = null;
      }
    },
    'interval:onStatus': function({ startTime }) {
      console.log(startTime);
      this.startTime = startTime;
    },
  },
};
</script>

<style scoped>
.headline-wrapper {
  align-items: center;
  display: flex;
  justify-content: flex-end;
}

.help-button {
  margin-left: 50px;
}

.you {
  color: var(--main-font-color);
}

.bold {
  font-weight: 500;
}
</style>
