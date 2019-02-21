<template>
  <div class="wrapper paddingTop">
    <div class="initial-wrapper">
      <button-component
        type="primary"
        size="small"
      >
        <p class="participants">
          {{ `${participants} participants` }}
        </p>
      </button-component>
      <button-component
        type="primary"
        size="small"
      >
        <p class="start disabled">
          active
        </p>
      </button-component>
      <button-component
        type="primary"
        size="small"
      >
        <p>invite</p>
      </button-component>
    </div>
    <div class="initial-text">
      <span class="bold">Session ends in:</span>
      {{ formatDuration(duration) }}
    </div>
  </div>
</template>

<script>
import ButtonComponent from '@/components/button';

import { formatDuration } from './utils';

export default {
  components: {
    ButtonComponent,
  },
  props: {
    duration: Number,
    participants: Number,
  },
  methods: {
    formatDuration,
  },
};
</script>

<style scoped>
.wrapper {
  margin: auto;
}

.initial-wrapper {
  align-items: flex-start;
  display: flex;
  justify-content: space-evenly;
}

.initial-wrapper > * {
  margin-right: 30px;
}

.initial-wrapper > *:last-child {
  margin-right: 0px;
}

.start {
  background-color: #798E91;
}

.start:hover,
.start.disabled {
  background-color: #798E91;
}

.participants {
  background-color: #696969;
  color: #B4B4B4;
  cursor: not-allowed;
  padding: 6px 12px !important;
}

.participants:hover {
  background-color: #696969;
}

.initial-text {
  font-size: 15px;
  margin-top: 28px;
  text-align: center;
}

.bold {
  font-weight: 500;
}

.disabled {
  color: #C9D2D3;
  cursor: not-allowed;
}
</style>
