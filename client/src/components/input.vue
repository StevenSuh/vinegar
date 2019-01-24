<template>
  <div class="input-wrapper">
    <input
      class="input"
      v-on:input="onInputChange"
      :autocomplete="autocomplete"
      :id="id"
      :name="name"
      :placeholder="placeholder"
      :type="type"
      :value="inputValue"
      ref="input"
    />
    <label class="label" :for="id" v-if="label"> {{ label }} </label>
  </div>
</template>

<script>
export default {
  beforeDestroy() {
    clearTimeout(this.searchTimeout);
  },
  data() {
    return {
      inputValue: this.value,
      searchDelay: 300,
      searchTimeout: null,
    };
  },
  methods: {
    onInputChange(e) {
      const {value} = e.target;
      if (this.onValidate && !this.onValidate(value)) {
        this.$refs.input.value = this.value;
        return;
      }

      this.inputValue = value;
      this.$refs.input.value = value;
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
    id: {
      type: String,
      default: '',
    },
    label: String,
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
    type: {
      type: String,
      default: 'text',
    },
    value: {
      type: String,
      default: '',
    },
  },
  watch: {
    value(value, oldValue) {
      if (value !== oldValue) {
        this.$refs.input.value = value;
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
  border-radius: 6px;
  font-size: 17px;
  font-weight: 300;
  padding: 18px 25px;
  transition: padding var(--transition-duration) var(--transition-curve);
  width: 100%;
}

.input::placeholder {
  color: var(--gray-font-color);
}

.input:focus {
  padding-top: 27px;
  padding-bottom: 9px;
}

.input:focus + .label {
  opacity: 1;
  transform: translateY(8px);
}

.label {
  color: var(--main-font-color);
  font-size: 14px;
  font-weight: 400;
  left: 25px;
  opacity: 0;
  position: absolute;
  top: 0;
  transition: opacity var(--transition-duration) var(--transition-curve),
    transform var(--transition-duration) var(--transition-curve);
  pointer-events: none;
  user-select: none;
}
</style>
