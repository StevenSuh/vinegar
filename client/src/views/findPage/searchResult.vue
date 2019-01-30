<template>
  <div class="result-wrapper">
    <div
      v-for="item in data"
      :key="item.sessionId"
      class="result-item"
      @click="onClickItemFactory(item);"
    >
      <div class="result-name">
        <h6 class="result-school" v-html="highlightSchool(item)" />
        <span class="name-filler" />
        <p class="result-session" v-html="highlightSession(item)" />
      </div>
      <p class="detail">
        {{ 'Created at ' + formatDate(item.createdAt) }}
        <span v-if="item.password" class="protected">
          {{ 'Protected' }} <span class="lock" v-html="PasswordIcon" />
        </span>
      </p>
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
    query: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      PasswordIcon,
    };
  },
  methods: {
    formatDate,
    highlightSchool,
    highlightSession,
    onClickItemFactory({ schoolName, sessionName }) {
      this.$router.push(`/session/${schoolName}/${sessionName}`);
    },
  },
};
</script>

<style scoped>
.result-wrapper {
  background-color: var(--white-bg-color);
  border: 1px solid var(--gray-bg-color-2);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  max-height: 340px;
  overflow-y: auto;
  padding: 10px 0;
  top: -1px;
  width: 100%;
}

.result-item {
  cursor: pointer;
  padding: 15px 20px;
}

.result-item:hover {
  background-color: var(--gray-bg-color-hover);
}

.result-name {
  margin-bottom: 10px;
}

.name-filler {
  padding-left: 9px;
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
