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
import { initSocket } from '@/services/socket';
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
    const { school } = this.$route.params;
    const { session } = this.$route.params;
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
        const url = `ws://${window.location.host}/ws${
          window.location.pathname
        }`;
        try {
          this.socket = new WebSocket(url);
        } catch (err) {
          handleErrorMiddleware(err, 'socket');
          return;
        }
        initSocket(this.socket);
        this.socket.addEventListener('open', () => {
          this.socket.sendEvent('socket:onInit');
          cb();
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
}

.hide {
  opacity: 0;
}
</style>
