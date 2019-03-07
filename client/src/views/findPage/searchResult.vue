<template>
  <div
    class="result-wrapper"
    @scroll="onScroll"
  >
    <div
      v-for="(item, index) in data"
      :key="index"
      class="result-item"
      :class="index === resultIndex ? 'selected' : ''"
      @click="onClickItemFactory(item);"
    >
      <div class="result-name">
        <h6
          class="result-school"
          v-html="highlightSchool(item)"
        />
        <span class="name-filler" />
        <p
          class="result-session"
          v-html="highlightSession(item)"
        />
      </div>
      <p class="detail">
        {{ `Created at ${formatDate(item.createdAt)} - ${item.status}` }}
        <span
          v-if="item.password"
          class="protected"
        >
          {{ 'Protected' }} <span
            class="lock"
            v-html="PasswordIcon"
          />
        </span>
      </p>
    </div>
    <div
      v-if="data.length === 0"
      class="result-empty paddingTop paddingBottom small"
    >
      No session found :(
    </div>
  </div>
</template>

<script>
import PasswordIcon from '!raw-loader!@/assets/lock.svg';

import { formatDate, highlightSchool, highlightSession } from './utils';

export default {
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    hasMore: Boolean,
    query: {
      type: String,
      default: '',
    },
    inputId: String,
    onSearch: Function,
  },
  data() {
    return {
      // data
      resultIndex: -1,

      // assets
      PasswordIcon,
    };
  },
  created() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('click', this.onBlur);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('click', this.onBlur);
  },
  methods: {
    formatDate,
    highlightSchool,
    highlightSession,
    onBlur(e) {
      if (e.target.id !== this.inputId) {
        this.resultIndex = -1;
      }
    },
    onClickItemFactory({ schoolName, sessionName }) {
      this.$router.push(`/app/session/${schoolName}/${sessionName}`);
    },
    onKeyDown(e) {
      if (e.target.id === this.inputId) {
        if (e.keyCode === 13) {
          const { schoolName, sessionName } = this.data[this.resultIndex];
          this.$router.push(`/app/session/${schoolName}/${sessionName}`);
        }
        if (e.keyCode === 38) {
          this.resultIndex = Math.max(this.resultIndex - 1, 0);
        }
        if (e.keyCode === 40) {
          this.resultIndex = Math.min(
            this.resultIndex + 1,
            this.data.length - 1,
          );
        }
      }
    },
    onScroll(e) {
      const {
        clientHeight,
        scrollHeight,
        scrollTop,
      } = e.target;
      const currentScroll = clientHeight + scrollTop;

      if (
        this.hasMore &&
        !this.searching &&
        scrollHeight - currentScroll <= 50
      ) {
        this.searching = true;
        this.onSearch(null, true);
      }
    },
  },
  watch: {
    data(value, oldValue) {
      if (value !== oldValue || value.length !== oldValue.length) {
        this.searching = false;
      }
    },
  },
};
</script>

<style scoped>
.result-wrapper {
  background-color: var(--white-bg-color);
  border: 1px solid var(--gray-bg-color-2);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  max-height: 340px;
  overflow-y: auto;
  padding: 10px 0;
  top: -1px;
  width: 100%;
}

.result-item {
  cursor: pointer;
  padding: 15px 24px;
}

.result-item:hover,
.result-item.selected {
  background-color: var(--gray-bg-color-hover);
}

.result-name {
  margin-bottom: 10px;
}

.name-filler {
  padding-left: 8px;
}

.result-school,
.result-session {
  display: inline-block;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.result-session {
  color: var(--dark-gray-font-color);
}

.detail {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.protected {
  right: 30px;
}

.lock {
  display: inline-block;
  height: 24px;
  right: -30px;
  position: absolute;
  top: -4px;
  width: 24px;
}

.result-empty {
  opacity: 0.5;
  text-align: center;
}
</style>

<style>
.highlightSearch {
  color: var(--main-font-color);
  font-weight: 500;
}

.lock > svg {
  stroke: var(--main-bg-color);
}
</style>
