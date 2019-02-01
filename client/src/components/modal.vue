<template>
  <div>
    <div
      class="bg-overlay"
      @click="onClose"
    />
    <div
      ref="content"
      class="content"
    >
      <slot />
    </div>
  </div>
</template>

<script>
const enterAnim = [
  { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' },
  { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
];

const enterTiming = {
  delay: 300,
  duration: 250,
  easing: 'cubic-bezier(0.8, 0, 0.2, 1.5)',
  fill: 'forwards',
};

const leaveAnim = [
  { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
  { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' },
];

const leaveTiming = {
  duration: 200,
  easing: 'cubic-bezier(0.8, 0, 0.2, 1.5)',
  fill: 'forwards',
};

export default {
  props: {
    onClose: Function,
  },
  beforeCreate() {
    document.body.classList.add('overflow');
  },
  mounted() {
    this.$refs.content.animate(enterAnim, enterTiming);
  },
  beforeDestroy() {
    this.$refs.content.animate(leaveAnim, leaveTiming);
    document.body.classList.remove('overflow');
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
  position: fixed !important;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
