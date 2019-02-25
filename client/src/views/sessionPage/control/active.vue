<template>
  <div class="wrapper paddingTop small">
    <div class="left">
      <p
        v-if="intervalUser"
        class="interval-msg"
      >
        <span class="interval-user">
          {{ intervalUser }}
        </span>
        {{ ' is currently typing...' }}
      </p>
      <!--
        <div class="rate-wrapper">
          <p class="rate-msg">Rate this Notetaker</p>
        </div>
      -->
    </div>
    <div class="right">
      <div class="button-wrapper">
        <download-button class="marginRight small" />
        <invite-button />
      </div>
      <div class="end-text">
        <span class="bold">
          Session ends in:
        </span>
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
      requestStartTime: null,
      remaining: this.endTime - Date.now(),
      startTime: null,
      targetTimestamp: 0,

      // requestAnimationFrame id
      countEndTimeId: null,
    };
  },
  mounted() {
    this.startTime = Date.now();
    this.remaining = this.endTime - this.startTime;
    this.countEndTimeId = window.requestAnimationFrame(this.onCountEndTime);
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
      this.remaining = this.endTime - this.startTime - actualTimestamp;
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
