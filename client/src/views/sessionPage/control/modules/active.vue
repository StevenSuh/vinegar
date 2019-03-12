<template>
  <div class="wrapper paddingTop small">
    <div class="left">
      <p
        v-if="intervalUserName"
        class="interval-msg"
      >
        <span class="interval-user"> {{ intervalUserName }} </span>
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
        <download-button
          class="marginRight small"
          :socket="socket"
        />
        <invite-button />
      </div>
      <div class="end-text">
        <span class="bold"> Session ends in: </span>
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
    intervalUserName: String,
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
      this.remaining = this.endTime - Date.now();

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
  text-align: right;
}

.button-wrapper {
  align-items: center;
  display: flex;
  justify-content: flex-end;
}

.bold {
  font-weight: 500;
}

@media (max-width: 700px) {
  .wrapper {
    flex-direction: column;
  }

  .left,
  .right {
    width: 100%;
  }

  .button-wrapper {
    justify-content: center;
  }

  .interval-msg,
  .end-text {
    text-align: center;
  }
}
</style>
