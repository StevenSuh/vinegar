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

import { initSocket } from '@/services/socket';
import {
  connectErrorMiddlewareWithCallback,
  disconnectErrorMiddleware,
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
      socket: null,
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
  beforeDestroy() {
    disconnectErrorMiddleware(this, this.onError);

    if (!this.socket.empty) {
      this.socket.close();
      this.socket = null;
    }
  },
  methods: {
    onError(msg) {
      this.errorModal = { header: 'An error has occurred.', msg };
      this.show = true;
    },
    onInit(callback) {
      if (!this.socket) {
        const { host, pathname } = window.location;
        const url = `ws://${host}/ws${pathname}`;

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
