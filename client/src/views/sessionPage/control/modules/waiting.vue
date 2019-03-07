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
      <invite-button />
    </div>
    <div class="initial-text">
      <span class="bold"> Session ends in: </span>
      {{ formatDuration(duration) }}
    </div>
  </div>
</template>

<script>
import ButtonComponent from '@/components/button';
import InviteButton from '@/views/sessionPage/control/components/inviteButton';

import { formatDuration } from '@/views/sessionPage/control/utils';

export default {
  components: {
    ButtonComponent,
    InviteButton,
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
  background-color: #798e91;
}

.start:hover,
.start.disabled {
  background-color: #798e91;
}

.participants {
  background-color: #696969;
  color: #b4b4b4;
  cursor: not-allowed;
  padding: 6px 12px !important;
}

.participants:hover {
  background-color: #696969;
}

.initial-text {
  font-size: 15px;
  margin-top: 24px;
  text-align: center;
}

.bold {
  font-weight: 500;
}

.disabled {
  color: #c9d2d3;
  cursor: not-allowed;
}
</style>
