<template>
  <div class="input-wrapper">
    <input
      :id="id"
      ref="input"
      class="input"
      :autocomplete="autocomplete"
      :class="{
        error: errorMessage,
        [size]: true,
        hasLabel: label,
        hasValue: currentValue,
      }"
      :maxlength="maxLen"
      :name="name"
      :placeholder="placeholder"
      :type="type"
      :value="currentValue"
      @input="onInputChange"
    />
    <label
      v-if="label"
      class="label"
      :for="id"
    >
      {{ label }}
    </label>
    <p
      v-if="errorMessage"
      class="error-message"
      :class="size"
    >
      {{ errorMessage }}
    </p>
    <p
      v-if="suggestion && !errorMessage"
      class="suggestion"
      :class="size"
    >
      {{ suggestion }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    autocomplete: {
      type: String,
      default: 'on',
    },
    autosearch: {
      type: String,
      default: 'off',
    },
    errorMessage: String,
    id: {
      type: String,
      default: '',
    },
    label: String,
    maxLen: String,
    name: {
      type: String,
      default: '',
    },
    onAutosearch: {
      type: Function,
      default: null,
    },
    onClearSearch: {
      type: Function,
      default: null,
    },
    onFormat: {
      type: Function,
      default: null,
    },
    onValidate: {
      type: Function,
      default: null,
    },
    placeholder: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    suggestion: String,
    type: {
      type: String,
      default: 'text',
    },
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      currentValue: this.value,
      searchDelay: 300,
      searchTimeout: null,
    };
  },
  watch: {
    value(val) {
      this.$refs.input.value = val;
    },
  },
  beforeDestroy() {
    clearTimeout(this.searchTimeout);
  },
  methods: {
    onInputChange(e) {
      e.preventDefault();
      let { value } = e.target;
      if (this.onFormat) {
        value = this.onFormat(value);
      }
      if (this.onValidate && !this.onValidate(value)) {
        this.$refs.input.value = this.currentValue;
        return;
      }
      this.currentValue = value;
      this.$refs.input.value = value;

      this.$emit('onChange', value);

      if (this.autosearch === 'on' && this.onAutosearch) {
        clearTimeout(this.searchTimeout);
        this.onSearchAutosearch(value);
      }
    },
    onSearchAutosearch(value) {
      if (value.length > 0) {
        this.searchTimeout = setTimeout(
          this.onAutosearch,
          this.searchDelay,
          value,
        );
      } else if (this.onClearSearch) {
        this.onClearSearch();
      }
    },
  },
};
</script>

<style scoped>
.input-wrapper {
  font-size: 16px;
  font-weight: 300;
  width: 100%;
}

.input {
  border: 1px solid var(--gray-bg-color-2);
  border-radius: 8px;
  font-size: 17px;
  font-weight: 300;
  height: 58px;
  padding: 18px 25px;
  width: 100%;
}

.input:focus {
  z-index: 100;
}

.input:focus + .label {
  z-index: 100;
}

.input.small {
  font-size: 15px;
  height: 48px;
  padding: 14px 17px;
}

.input.x-small {
  font-size: 13px;
  height: 30px;
  padding: 7px 12px;
}

.input.hasLabel {
  transition: border-color var(--transition-duration) var(--transition-curve),
    padding var(--transition-duration) var(--transition-curve);
  will-change: border-color, padding;
}

.input.error {
  border-color: var(--main-bg-color);
}

.error-message {
  color: var(--main-font-color);
  font-size: 15px;
  margin-top: 6px;
  padding-left: 26px;
}

.error-message.small {
  font-size: 13px;
  margin-top: 4px;
  padding-left: 10px;
}

.error-message.x-small {
  font-size: 12px;
  margin-top: 3px;
  padding-left: 10px;
}

.input::placeholder {
  color: var(--gray-font-color);
  transition: opacity var(--transition-duration) var(--transition-curve),
    transform var(--transition-duration) var(--transition-curve);
  will-change: opacity, transform;
}

.input:focus::placeholder {
  opacity: 0;
}

.input.hasLabel:focus::placeholder,
.input.hasLabel.hasValue::placeholder {
  transform: translateY(-18px);
}

.input.hasLabel.small:focus::placeholder,
.input.hasLabel.hasValue.small::placeholder {
  transform: translateY(-16px);
}

.input.error::placeholder,
.input.error + .label {
  color: var(--main-font-color);
}

.input.hasLabel:focus,
.input.hasLabel.hasValue {
  padding-top: 27px;
  padding-bottom: 9px;
}

.input.hasLabel.small:focus,
.input.hasLabel.hasValue.small {
  padding-top: 22px;
  padding-bottom: 6px;
}

.input.hasLabel:focus + .label,
.input.hasLabel.hasValue + .label {
  opacity: 1;
  transform: translateY(8px);
}

.input.hasLabel:focus + .label {
  color: var(--main-font-color);
}

.input.hasLabel.small:focus + .label,
.input.hasLabel.hasValue.small + .label {
  opacity: 1;
  transform: translateY(5px);
}

.input.hasLabel.x-small:focus + .label {
  display: none;
}

.label {
  color: var(--gray-font-color);
  font-size: 14px;
  font-weight: 400;
  left: 26px;
  opacity: 0;
  position: absolute;
  top: 0;
  transition: opacity var(--transition-duration) var(--transition-curve),
    transform var(--transition-duration) var(--transition-curve);
  transform: translateY(calc(29px - 50%));
  pointer-events: none;
  user-select: none;
  will-change: opacity, transform;
}

.input.small + .label {
  font-size: 13px;
  left: 18px;
}

.input.x-small + .label {
  display: none;
}

.suggestion {
  font-size: 15px;
  font-weight: 300;
  margin-top: 6px;
  opacity: 0.3;
  padding-left: 26px;
}

.suggestion.small {
  font-size: 13px;
  margin-top: 4px;
  padding-left: 10px;
}

.suggestion.x-small {
  font-size: 12px;
  margin-top: 3px;
  padding-left: 10px;
}
</style>
