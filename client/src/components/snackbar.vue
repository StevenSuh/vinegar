<template>
  <div class="snackbar-wrapper">
    <transition-group
      name="snackbar-transition"
      tag="div"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="snackbar-item"
      >
        <p class="snackbar-msg">
          {{ item.msg }}
        </p>
        <span
          class="close hover"
          @click="onClickClose(item.id);"
          v-html="CloseIcon"
        />
      </div>
    </transition-group>
  </div>
</template>

<script>
import CloseIcon from '!raw-loader!@/assets/x.svg';
import { connectErrorMiddlewareWithCallback } from '@/services/middleware';

export default {
  data() {
    return {
      // state
      items: [],
      timeouts: {},

      // assets
      CloseIcon,
    };
  },
  created() {
    connectErrorMiddlewareWithCallback(this, msg => {
      const id = Date.now();

      if (!this.timeouts[id]) {
        this.items.push({ id, msg });
        this.timeouts[id] = setTimeout(this.closeItem, 5000, id);
      }
    });
  },
  methods: {
    onClickClose(id) {
      clearTimeout(this.timeouts[id]);
      this.closeItem(id);
    },
    closeItem(id) {
      if (document.hasFocus()) {
        const index = this.items.find(item => item.id === id);
        this.items.splice(index, 1);
        delete this.timeouts[id];
        return;
      }
      const fn = () => {
        this.timeouts[id] = setTimeout(this.closeItem, 5000, id);
        window.removeEventListener(fn);
      };
      window.addEventListener('focus', fn);
    },
  },
};
</script>

<style scoped>
.snackbar-wrapper {
  bottom: 20px;
  position: fixed;
  right: 25px;
  z-index: 10000;
}

.snackbar-item {
  align-items: center;
  background-color: var(--black-font-color);
  border-radius: 8px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
  color: var(--main-font-color);
  display: flex;
  font-size: 15px;
  justify-content: space-between;
  line-height: 1.5em;
  margin-top: 15px;
  padding: 15px 24px;
  width: 300px;
  will-change: opacity, transform;
}

@media (min-width: 1440px) {
  .snackbar-item {
    width: 400px;
  }
}

.close {
  cursor: pointer;
  height: 20px;
  margin-left: 20px;
  width: 20px;
}
</style>

<style>
.snackbar-transition-enter-active,
.snackbar-transition-leave-active {
  transition: opacity var(--transition-duration) var(--transition-curve),
    transform var(--transition-duration) var(--transition-curve);
}

.snackbar-transition-enter {
  opacity: 0;
  transform: translateY(10px);
}

.snackbar-transition-leave-to {
  opacity: 0;
}

.close > svg {
  height: 20px;
  width: 20px;
}

.close > svg > path {
  stroke: var(--main-font-color);
}
</style>
