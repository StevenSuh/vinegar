<template>
  <div class="input-wrapper">
    <input
      class="input"
      v-on:input="onInputChange"
      :autocomplete="autocomplete"
      :class="[errorMessage ? 'error' : '', size]"
      :id="id"
      :maxlength="maxLen"
      :name="name"
      :placeholder="placeholder"
      :type="type"
      :value="value"
      ref="input"
    />
    <label class="label" :for="id" v-if="label"> {{ label }} </label>
    <p class="error-message" :class="size" v-if="errorMessage">
      {{ errorMessage }}
    </p>
    <p class="suggestion" v-if="suggestion && !errorMessage">
      {{ suggestion }}
    </p>
  </div>
</template>

<script>
export default {
  beforeDestroy() {
    clearTimeout(this.searchTimeout);
  },
  data() {
    return {
      searchDelay: 300,
      searchTimeout: null,
    };
  },
  methods: {
    onInputChange(e) {
      const {value} = e.target;
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
          value
        );
      } else {
        this.onClearSearch && this.onClearSearch();
      }
    },
  },
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
  border-radius: 12px;
  font-size: 17px;
  font-weight: 300;
  padding: 18px 25px;
  transition: padding var(--transition-duration) var(--transition-curve);
  width: 100%;
}

.input.error {
  border-color: var(--main-bg-color);
}

.input.error::placeholder {
  color: var(--main-font-color);
}

.error-message {
  color: var(--main-font-color);
  font-size: 15px;
  margin-top: 6px;
  padding-left: 15px;
}

.error-message.small {
  font-size: 13px;
  padding-left: 5px;
}

.input.small {
  font-size: 15px;
  padding: 14px 20px;
}

.input::placeholder {
  color: var(--gray-font-color);
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
  left: 21px;
}

.suggestion {
  font-size: 15px;
  font-weight: 300;
  margin-top: 6px;
  opacity: 0.3;
  padding-left: 26px;
}
</style>
