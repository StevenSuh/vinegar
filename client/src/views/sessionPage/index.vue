<template>
  <div
    class="main"
    :class="!show ? 'hide' : ''"
  >
    <SessionPageWrapper
      v-if="show"
      :socket="socket"
    />
    <transition name="fadeNoDelay">
      <Welcome
        v-if="isWelcome"
        :on-close="onCloseIsWelcome"
        :on-show="onShow"
      />
    </transition>
    <transition name="fadeNoDelay">
      <ErrorModal
        v-if="errorModal"
        :error-modal="errorModal"
      />
    </transition>
  </div>
</template>

<script>
import ErrorModal from '@/views/sessionPage/errorModal';

import { EmptySocket, initSocket } from '@/services/socket';
import {
  connectErrorMiddlewareWithCallback,
  disconnectErrorMiddleware,
  handleErrorMiddleware,
} from '@/services/middleware';

import Welcome from '@/views/sessionPage/welcomeModal';

import SessionPageWrapper from './wrapper';

export default {
  components: {
    ErrorModal,
    SessionPageWrapper,
    Welcome,
  },
  data() {
    return {
      errorModal: null,
      isWelcome: true,
      socket: EmptySocket,
      show: false,
    };
  },
  beforeCreate() {
    const { school, session } = this.$route.params;
    document.title = `Vinegar - ${school}/${session}`;
  },
  created() {
    connectErrorMiddlewareWithCallback(this, this.onError);
  },
  mounted() {
    this.track();

    this.preventZoom = document.createElement('meta');
    this.preventZoom.name = 'viewport';
    this.preventZoom.content =
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
    document.head.appendChild(this.preventZoom);
  },
  beforeDestroy() {
    disconnectErrorMiddleware(this, this.onError);
    this.socket.closeSocket();
    document.head.removeChild(this.preventZoom);
  },
  methods: {
    onSlowConnection() {
      window.addEventListener('online', this.onFastConnection);
    },
    onFastConnection() {
      window.removeEventListener('online', this.onFastConnection);
      handleErrorMiddleware(
        'Detected slow internet... Try refreshing once connected.',
        'snackbar',
      );
    },
    onError(msg, type) {
      if (type === 'snackbar') {
        return;
      }
      this.errorModal = { header: 'An error has occurred.', msg };
      this.show = true;
    },
    onInit(callback) {
      if (this.socket.empty === true) {
        const { host, pathname } = window.location;
        const websocket = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';

        const url = `${websocket}://${host}/ws${pathname}`;

        this.socket = new WebSocket(url);
        initSocket(this.socket);
        this.socket.addEventListener('open', () => {
          this.socket.startPingPong();
          this.socket.sendEvent('socket:onInit');
          callback();
        });
      } else {
        callback();
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
    track() {
      const { school, session } = this.$route.params;
      this.$ga.page(`/app/session/${school}/${session}`);
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
