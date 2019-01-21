<template>
  <span class="loader" :class="[color, size]" />
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: 'black',
    },
    size: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>
.loader {
  animation: load 0.75s linear infinite;
  border: 2.5px solid transparent;
  border-top: 2.5px solid var(--black-font-color);
  border-right: 2.5px solid var(--black-font-color);
  border-radius: 50%;
  display: block;
  height: 24px;
  width: 24px;
}

.loader.white {
  border-top-color: var(--white-font-color);
  border-right-color: var(--white-font-color);
}

@keyframes load {
  from {
    transform: rotate(0deg) translateZ(0);
  }
  to {
    transform: rotate(360deg) translateZ(0);
  }
}
</style>
