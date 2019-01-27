<template>
  <div class="result-wrapper">
    <div
      class="result-item"
      v-on:click="onClickItemFactory(item)"
      v-for="item in data"
      :key="item.sessionId"
    >
      <div class="result-name">
        <h6 class="result-school" v-html="highlightSchool(item)" />
        <span class="name-filler" />
        <p class="result-session" v-html="highlightSession(item)" />
      </div>
      <p>{{ 'Created at ' + formatDate(item.createdAt) }}</p>
    </div>
  </div>
</template>

<script>
import {
  formatDate,
  highlightSchool,
  highlightSession,
} from './utils';

export default {
  methods: {
    formatDate,
    highlightSchool,
    highlightSession,
    onClickItemFactory: function({ schoolName, sessionName }) {
      this.$router.push(`/session/${schoolName}/${sessionName}`);
    },
  },
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
};
</script>

<style scoped>
.result-wrapper {
  background-color: var(--white-bg-color);
  border: 1px solid var(--gray-bg-color-2);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  max-height: 340px;
  overflow-y: scroll;
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
</style>

<style>
.highlightSearch {
  color: var(--main-font-color);
  font-weight: 500;
}
</style>
