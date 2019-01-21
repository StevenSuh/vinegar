<template>
  <button class="button" :class="[type, size]"><slot></slot></button>
</template>

<script>
export default {
  props: {
    size: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'primary',
    },
  },
  beforeCreate() {
    if (!this.$slots.default[0].tag) {
      throw new Error('Slot/child is missing a tag');
    }
  },
};
</script>

<style scoped>
.button > * {
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  padding: 10px 24px;
  text-align: center;
}

.button.medium > * {
  font-size: 20px;
  padding: 14px 36px;
}

.button.large > * {
  font-size: 22px;
  padding: 16px 42px;
}

.primary > * {
  background-color: var(--main-bg-color);
  color: var(--white-font-color);
  transition: background-color var(--transition-duration)
    var(--transition-curve);
}

.primary:hover > * {
  background-color: var(--main-bg-color-hover);
}

.minimal > * {
  transition: color var(--transition-duration) var(--transition-curve);
}

.minimal:hover > * {
  color: var(--main-font-color);
}

@media (max-width: 416px) {
  .button.medium > * {
    font-size: 16px;
  }

  .button.large > * {
    font-size: 16px;
  }
}
</style>
