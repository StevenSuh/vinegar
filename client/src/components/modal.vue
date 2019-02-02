<template>
  <div>
    <div
      class="bg-overlay"
      @click="onClose"
    />
    <transition name="fadeNoDelay">
      <div class="loader-wrapper" v-if="isLoading">
        <Loader color="white" size="large" />
      </div>
    </transition>
    <div
      ref="content"
      class="content"
      v-for="n in steps"
      :key="n"
    >
      <slot :name="`modal-${n}`" />
    </div>
  </div>
</template>

<script>
import Loader from '@/components/loader';

const enterAnim = [
  {
    opacity: 0,
    transform: 'translate(-50%, -50%) scale(0.8)',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  {
    opacity: 1,
    transform: 'translate(-50%, -50%) scale(1)',
    pointerEvents: 'auto',
    userSelect: 'auto',
  },
];

const enterTiming = {
  delay: 300,
  duration: 250,
  easing: 'cubic-bezier(0.8, 0, 0.2, 1.5)',
  fill: 'forwards',
};

const leaveAnim = [
  {
    opacity: 1,
    transform: 'translate(-50%, -50%) scale(1)',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  {
    opacity: 0,
    transform: 'translate(-50%, -50%) scale(0.8)',
    pointerEvents: 'auto',
    userSelect: 'auto',
  },
];

const leaveTiming = {
  duration: 200,
  easing: 'cubic-bezier(0.8, 0, 0.2, 1.5)',
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
    currentStep: {
      default: 0,
      type: Number,
    },
    steps: {
      default: 1,
      type: Number,
    },
  },
  beforeCreate() {
    document.body.classList.add('overflow');
  },
  mounted() {
    if (!this.isLoading) {
      this.$refs.content[this.currentStep].animate(enterAnim, enterTiming);
    }
  },
  beforeDestroy() {
    this.$refs.content[this.currentStep].animate(leaveAnim, leaveTiming);
    document.body.classList.remove('overflow');
  },
  watch: {
    isLoading(value, oldValue) {
      if (!value && oldValue) {
        this.$refs.content[this.currentStep].animate(enterAnim, enterTiming);
      }
    },
    currentStep(value, oldValue) {
      if (value !== oldValue) {
        this.$refs.content[oldValue].animate(leaveAnim, leaveTiming);
        this.$refs.content[value].animate(enterAnim, enterTiming);
      }
    }
  },
};
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
}

.content {
  background-color: var(--white-bg-color);
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
  left: 50%;
  opacity: 0;
  pointer-events: none;
  position: fixed !important;
  user-select: none;
  top: 50%;
  transform: translate(-50%, -50%) scale(0.8);
}

.loader-wrapper {
  left: 50%;
  padding: 50px;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
