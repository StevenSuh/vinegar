<template>
  <div class="interval-wrapper marginTop">
    <div class="interval-text">
      <p class="bold">
        Turn ending in:
      </p>
      <p>{{ formatDuration(remaining) }}</p>
    </div>
  </div>
</template>

<script>
import { formatDuration } from '@/views/sessionPage/control/utils';

export default {
  props: {
    isInterval: {
      default: false,
      type: Boolean,
    },
    intervalEndTime: {
      default: null,
      type: Number,
    },
  },
  data() {
    return {
      // isInterval
      requestStartTime: null,
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
  mounted() {
    this.intervalStartTime = Date.now();
    this.remaining = this.intervalEndTime - this.intervalStartTime;
    this.countEndTimeId = window.requestAnimationFrame(this.onCountEndTime);
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
  },
};
</script>

<style scoped>
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
