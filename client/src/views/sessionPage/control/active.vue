<template>
  <div class="wrapper paddingTop small">
    <div class="left">
      <p class="interval-msg">
        <span class="interval-user">{{ intervalUser }}</span>
        {{ ' is currently typing...' }}
      </p>
      <!-- <div class="rate-wrapper">
        <p class="rate-msg">Rate this Notetaker</p>
      </div> -->
    </div>
    <div class="right">
      <div class="button-wrapper">
        <download-button class="marginRight small" />
        <invite-button />
      </div>
      <div class="end-text">
        <span class="bold">Session ends in:</span>
        {{ formatDuration(remaining) }}
      </div>
    </div>
  </div>
</template>

<script>
import DownloadButton from './downloadButton';
import InviteButton from './inviteButton';

import { formatDuration } from './utils';

export default {
  components: {
    DownloadButton,
    InviteButton,
  },
  props: {
    endTime: Number,
    intervalUser: String,
    isOwner: Boolean,
    socket: [Object, WebSocket],
  },
  data() {
    return {
      remaining: Math.floor((this.endTime - Date.now()) / 1000),
      startTime: null,
      targetTimestamp: 0,
    };
  },
  mounted() {
    this.startTime = Date.now();
    this.remaining = Math.floor((this.endTime - this.startTime) / 1000);
    window.requestAnimationFrame(this.onCountEndTime);
  },
  methods: {
    formatDuration,
    onCountEndTime(timestamp) {
      const remaining = this.endTime - this.startTime - timestamp;
      const timeout = 1000 + (this.targetTimestamp - timestamp);

      this.remaining = Math.floor(remaining / 1000);
      this.targetTimestamp = timestamp + timeout;

      if (this.remaining > 0) {
        setTimeout(window.requestAnimationFrame, timeout, this.onCountEndTime);
      }
    },
  },
};
</script>

<style scoped>
.wrapper {
  align-items: flex-start;
  display: flex;
  width: 100%;
}

.left {
  width: 50%;
}

.right {
  width: 50%;
}

.interval-msg {
  font-size: 15px;
}

.interval-user {
  color: var(--main-font-color);
  font-weight: 500;
}

.rate-msg {
  font-size: 15px;
  /* font-weight: 300; */
  text-transform: uppercase;
}

.end-text {
  font-size: 15px;
  margin-top: 15px;
  text-align: center;
}

.button-wrapper {
  align-items: center;
  display: flex;
  justify-content: center;
}

.bold {
  font-weight: 500;
}
</style>
