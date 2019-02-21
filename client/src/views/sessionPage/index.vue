<template>
  <div
    class="main"
    :class="!show ? 'hide' : ''"
  >
    <SessionPageWrapper
      v-if="show"
      :error-modal="errorModal"
      :socket="socket"
    />
    <transition name="fadeNoDelay">
      <Welcome
        v-if="isWelcome"
        :on-close="onCloseIsWelcome"
        :on-show="onShow"
      />
    </transition>
  </div>
</template>

<script>
import { initSocket, EmptySocket } from '@/services/socket';
import { handleErrorMiddleware } from '@/services/middleware';

import Welcome from '@/views/sessionPage/welcomeModal';

import SessionPageWrapper from './wrapper';

export default {
  components: {
    Welcome,
    SessionPageWrapper,
  },
  data() {
    return {
      errorModal: null,
      isWelcome: true,
      socket: null,
      show: false,
      idleTimeout: null,
    };
  },
  beforeCreate() {
    const { school, session } = this.$route.params;
    document.title = `Vinegar - ${school}/${session}`;
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  },
  methods: {
    onInit(cb) {
      if (!this.socket) {
        const { school, session } = this.$route.params;

        const url = `ws://${window.location.host}/ws${
          window.location.pathname
        }`;

        try {
          this.socket = new WebSocket(url);
        } catch (err) {
          this.errorModal = {
            header: 'An error has occurred.',
            msg: `You have been disconnected from session: ${school}/${session}.`,
          };
          handleErrorMiddleware(err, 'socket');
          return;
        }

        initSocket(this.socket);
        this.socket.addEventListener('open', () => {
          this.socket.startPingPong();
          this.socket.sendEvent('socket:onInit');
          cb();
        });
        this.socket.addEventListener('close', () => {
          this.errorModal = {
            header: 'An error has occurred.',
            msg: `You have been disconnected from session: ${school}/${session}.`,
          };
          handleErrorMiddleware(`You have been disconnected from session: ${school}/${session}.`, 'socket');
          this.socket = EmptySocket();
        });
      } else {
        cb();
      }
    },
    onCloseIsWelcome() {
      this.isWelcome = false;
      this.onInit(() => {
        setTimeout(() => {
          this.socket.sendEvent('socket:onEnter');
          this.show = true;
        }, 200);
      });
    },
    onShow() {
      this.onInit(() => {
        this.show = true;
      });
    },
  },
};
</script>

<style scoped>
.main {
  transition: opacity var(--transition-duration) var(--transition-curve);
  transition-delay: var(--transition-duration);
}

.hide {
  opacity: 0;
}
</style>
