<template>
  <span
    ref="loader"
    class="loader"
    :class="[color, size]"
  />
</template>

<script>
const animation = [{transform: 'rotate(0deg)'}, {transform: 'rotate(360deg)'}];

const timing = {
  duration: 500,
  iterations: Infinity,
};

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
  mounted() {
    this.$refs.loader.animate(animation, timing);
  },
};
</script>

<style scoped>
.loader {
  border: 2.5px solid transparent;
  border-top: 2.5px solid var(--black-font-color);
  border-right: 2.5px solid var(--black-font-color);
  border-radius: 50%;
  display: block;
  height: 24px;
  width: 24px;
}

.loader.medium {
  border-width: 3px;
  height: 50px;
  width: 50px;
}

.loader.large {
  border-width: 4px;
  height: 74px;
  width: 74px;
}

.loader.x-large {
  border-width: 5px;
  height: 100px;
  width: 100px;
}

.loader.white {
  border-top-color: var(--white-font-color);
  border-right-color: var(--white-font-color);
}

.loader.red {
  border-top-color: var(--main-bg-color);
  border-right-color: var(--main-bg-color);
}

.loader.gray {
  border-top-color: var(--gray-font-color);
  border-right-color: var(--gray-font-color);
}
</style>
