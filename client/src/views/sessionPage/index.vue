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
      isWelcome: true,
      socket: null,
      show: false,
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
