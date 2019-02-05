<template>
  <div class="input-wrapper">
    <input
      :id="id"
      ref="input"
      class="input"
      :autocomplete="autocomplete"
      :class="[errorMessage ? 'error' : '', size]"
      :maxlength="maxLen"
      :name="name"
      :placeholder="placeholder"
      :type="type"
      :value="value"
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
      searchDelay: 300,
      searchTimeout: null,
    };
  },
  beforeDestroy() {
    clearTimeout(this.searchTimeout);
  },
  methods: {
    onInputChange(e) {
      const { value } = e.target;
      this.$refs.input.value = this.value;

      if (this.onValidate && !this.onValidate(value)) {
        return;
      }

      this.$emit('onChange', value);

      if (this.autosearch === 'on' && this.onAutosearch) {
        clearTimeout(this.searchTimeout);
        this.onSearchAutosearch(value);
      }
    },
    onSearchAutosearch(value) {
      if (value.length > 2) {
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
  padding: 18px 25px;
  transition: padding var(--transition-duration) var(--transition-curve);
  width: 100%;
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

.input.small {
  font-size: 15px;
  padding: 14px 17px;
}

.input::placeholder {
  color: var(--gray-font-color);
  transition: color var(--transition-duration) var(--transition-curve);
}

.input.error::placeholder {
  color: var(--main-font-color);
}

.input:focus {
  padding-top: 27px;
  padding-bottom: 9px;
}

.input.small:focus {
  padding-top: 22px;
  padding-bottom: 6px;
}

.input:focus + .label {
  opacity: 1;
  transform: translateY(8px);
}

.input.small:focus + .label {
  opacity: 1;
  transform: translateY(5px);
}

.label {
  color: var(--main-font-color);
  font-size: 14px;
  font-weight: 400;
  left: 26px;
  opacity: 0;
  position: absolute;
  top: 0;
  transition: opacity var(--transition-duration) var(--transition-curve),
    transform var(--transition-duration) var(--transition-curve);
  pointer-events: none;
  user-select: none;
}

.input.small + .label {
  font-size: 13px;
  left: 18px;
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
</style>
