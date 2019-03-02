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
import DownloadButton from '@/views/sessionPage/control/components/downloadButton';
import InviteButton from '@/views/sessionPage/control/components/inviteButton';

import { formatDuration } from '@/views/sessionPage/control/utils';

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
      remaining: null,
      countEndTimeId: null,
    };
  },
  mounted() {
    this.startTime = Date.now();
    this.remaining = this.endTime - Date.now();
    this.countEndTimeId = window.requestAnimationFrame(this.onCountEndTime);
  },
  beforeDestroy() {
    if (this.countEndTimeId) {
      window.cancelAnimationFrame(this.countEndTimeId);
    }
  },
  methods: {
    formatDuration,
    onCountEndTime() {
      this.remaining -= 1000;

      if (this.remaining > 0) {
        setTimeout(() => {
          this.countEndTimeId = window.requestAnimationFrame(
            this.onCountEndTime,
          );
        }, 1000);
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
