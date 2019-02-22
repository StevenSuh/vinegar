<template>
  <div
    class="tooltip"
    :class="{ show: show || forceShow, [position]: true }"
    ref="tooltip"
  >
    <slot />
  </div>
</template>

<script>
export default {
  data() {
    return {
      reset: false,
      show: false,
    };
  },
  props: {
    forceShow: {
      default: false,
      type: Boolean,
    },
    position: String,
    onClick: {
      default: null,
      type: Function,
    },
    onResetClick: {
      default: null,
      type: Function
    },
  },
  methods: {
    onClickParent(e) {
      this.onClick();

      if (this.onResetClick) {
        this.reset = true;
      }
    },
    onMouseEnter() {
      if (!this.show) {
        this.show = true;

        if (this.reset) {
          this.onResetClick();
          this.reset = false;
        }
      }
    },
    onMouseLeave() {
      if (this.show) {
        this.show = false;
      }
    },
  },
  mounted() {
    const { tooltip } = this.$refs;

    if (!tooltip.parentElement) {
      throw new Error('There must be a parent element to enable tooltip.');
    }

    if (this.onClick) {
      tooltip.parentElement.addEventListener('click', this.onClickParent);
    }
    tooltip.parentElement.addEventListener('mouseenter', this.onMouseEnter);
    tooltip.parentElement.addEventListener('mouseleave', this.onMouseLeave);
  },
  beforeDestroy() {
    const { tooltip } = this.$refs;

    if (!tooltip.parentElement) {
      throw new Error('There must be a parent element to enable tooltip.');
    }

    if (this.onClick) {
      tooltip.parentElement.removeEventListener('click', this.onClickParent);
    }
    tooltip.parentElement.removeEventListener('mouseenter', this.onMouseEnter);
    tooltip.parentElement.removeEventListener('mouseleave', this.onMouseLeave);
  },
}
</script>

<style scoped>
.tooltip {
  background-color: #444444;
  border-radius: 8px;
  color: var(--white-font-color);
  font-size: 13px;
  opacity: 0;
  padding: 8px 12px;
  pointer-events: none;
  position: absolute;
  transition: opacity var(--transition-mid-duration) var(--transition-curve);
  user-select: none;
  width: max-content;
  will-change: opacity;
}

.tooltip::before {
  content: '';
  height: 0;
  position: absolute;
  width: 0;
}

.tooltip.show {
  opacity: 1;
  pointer-events: auto;
  user-select: auto;
}

.tooltip.top {
  left: 50%;
  top: 0;
  transform: translate(-50%, calc(-100% - 13px));
}

.tooltip.bottom {
  left: 50%;
  bottom: 0;
  transform: translate(-50%, calc(100% + 13px));
}

.tooltip.left {
  left: 0;
  top: 50%;
  transform: translate(calc(-100% - 13px), -50%);
}

.tooltip.right {
  right: 0;
  top: 50%;
  transform: translate(calc(100% + 13px), -50%);
}

.tooltip.top::before {
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid #444444;
  left: 50%;
  bottom: 1px;
  transform: translateX(-50%) translateY(100%);
}

.tooltip.bottom::before {
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 10px solid #444444;
  left: 50%;
  top: 1px;
  transform: translateX(-50%) translateY(-100%);
}

.tooltip.left::before {
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 10px solid #444444;
  right: 1px;
  top: 50%;
  transform: translateX(100%) translateY(-50%);
}

.tooltip.right::before {
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 10px solid #444444;
  left: 1px;
  top: 50%;
  transform: translateX(-100%) translateY(-50%);
}
</style>
