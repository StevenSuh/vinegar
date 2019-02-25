<template>
  <div
    class="will-hide"
    :class="!open ? 'hide' : ''"
  >
    <div
      class="bg-overlay"
      @click="onClose"
    />
    <transition name="fadeNoDelay">
      <div
        v-if="isLoading"
        class="loader-wrapper"
      >
        <Loader
          color="white"
          size="large"
        />
      </div>
    </transition>
    <div
      class="content-wrapper will-hide"
      :class="!show ? 'hide' : ''"
    >
      <div
        v-for="n in steps"
        ref="content"
        :key="n"
        class="content"
      >
        <slot
          v-if="steps > 1"
          :name="`modal-${n}`"
        /> <slot v-else />
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */
import Loader from '@/components/loader';

const enterAnim = [
  { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' },
  { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
];
const enterTiming = {
  delay: 400,
  duration: 200,
  easing: 'cubic-bezier(0.8, 0, 0.2, 1)',
  fill: 'forwards',
};

const leaveAnim = [{ opacity: 1 }, { opacity: 0 }];
const leaveTiming = {
  delay: 0,
  duration: 200,
  easing: 'cubic-bezier(0.8, 0, 0.2, 1)',
  fill: 'forwards',
};

export default {
  components: {
    Loader,
  },
  props: {
    isLoading: {
      default: false,
      type: Boolean,
    },
    onClose: {
      default: () => {},
      type: Function,
    },
    onEsc: {
      default: () => {},
      type: Function,
    },
    currentStep: {
      default: 0,
      type: Number,
    },
    open: {
      default: true,
      type: Boolean,
    },
    show: {
      default: true,
      type: Boolean,
    },
    steps: {
      default: 1,
      type: Number,
    },
  },
  watch: {
    isLoading(value, oldValue) {
      if (!value && oldValue) {
        this.onEnter(this.$refs.content[this.currentStep]);
      }
    },
    show(value, oldValue) {
      if (value && value !== oldValue) {
        this.onEnter(this.$refs.content[this.currentStep], 600);
      }
    },
    open(value, oldValue) {
      if (value && value !== oldValue) {
        this.onEnter(this.$refs.content[this.currentStep], 0);
      }
    },
    currentStep(value, oldValue) {
      if (value !== oldValue) {
        this.onLeave(this.$refs.content[oldValue]);
        this.onEnter(this.$refs.content[value]);
      }
    },
  },
  beforeCreate() {
    document.body.classList.add('overflow');
    window.addEventListener('keyup', this.onKeyup);
  },
  mounted() {
    if (!this.isLoading && this.open && this.show) {
      this.onEnter(this.$refs.content[this.currentStep], 200);
    }
  },
  beforeDestroy() {
    this.onLeave(this.$refs.content[this.currentStep]);
    document.body.classList.remove('overflow');
    window.removeEventListener('keyup', this.onKeyup);
  },
  methods: {
    onKeyup(e) {
      if (e.keyCode === 27) {
        this.onEsc();
      }
    },
    onEnter(el, delay) {
      if (!el.animation) {
        el.style.pointerEvents = 'auto';
        el.style.userSelect = 'auto';

        let timing = enterTiming;
        if (delay !== undefined) {
          timing = { ...timing, delay };
        }
        const animation = el.animate(enterAnim, timing);
        animation.onfinish = () => {
          el.animation = null;
        };
        el.animation = animation;
      }
    },
    onLeave(el) {
      if (!el.animation) {
        el.style.pointerEvents = 'none';
        el.style.userSelect = 'none';
        const animation = el.animate(leaveAnim, leaveTiming);
        animation.onfinish = () => {
          el.animation = null;
        };
        el.animation = animation;
      }
    },
  },
};
/* eslint-enable no-param-reassign */
</script>

<style>
.overflow {
  overflow: hidden;
}
</style>

<style scoped>
.bg-overlay {
  background-color: var(--black-font-color);
  opacity: 0.6;
  height: 100vh;
  left: 0;
  position: fixed !important;
  top: 0;
  width: 100vw;
  z-index: 1001;
}

.content {
  background-color: var(--white-bg-color);
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
  left: 50%;
  opacity: 0;
  position: fixed !important;
  pointer-events: none;
  user-select: none;
  top: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  will-change: transform, opacity;
  z-index: 1001;
}

.will-hide {
  transition: opacity var(--transition-duration) var(--transition-curve);
  will-change: opacity;
  z-index: 1001;
}

.hide {
  opacity: 0 !important;
  pointer-events: none;
  user-select: none;
}

.loader-wrapper {
  left: 50%;
  padding: 50px;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
