<template>
  <div class="wrapper paddingTop">
    <div class="initial-wrapper">
      <input-component
        id="participantsNumId"
        autocomplete="off"
        name="participants"
        placeholder="# of participants"
        size="x-small"
        :error-message="participantsError"
        :value="participants"
        :on-validate="onValidateNumber"
        @onChange="onChangeParticipants"
        v-if="isOwner"
      />
      <button-component
        type="primary"
        size="small"
      >
        <p
          class="start"
          :class="{ disabled: !isOwner }"
          @click="onStart"
        >
          start
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
import InputComponent from '@/components/input';

import { formatDuration } from './utils';

const numRegex = new RegExp('^$|^[0-9]+$');

export default {
  components: {
    ButtonComponent,
    InputComponent,
  },
  props: {
    duration: Number,
    isOwner: Boolean,
    socket: [Object, WebSocket],
  },
  data() {
    return {
      participants: null,
      participantsError: null,
    };
  },
  methods: {
    onChangeParticipants(value) {
      this.participants = value;
    },
    onStart() {
      if (this.isOwner) {
        const hasError = this.onValidateParticipants();

        if (!hasError) {
          const participants = parseInt(this.participants, 10);
          this.socket.sendEvent('control:onInit', { participants });
        }
      }
    },
    onValidateParticipants() {
      if (!this.participants) {
        this.participantsError = 'This field is required.';
        return true;
      }
      if (this.participants === '0') {
        this.participantsError = 'Must be greater than 0.';
        return true;
      }
      this.participantsError = '';
      return false;
    },
    onValidateNumber(value) {
      return Boolean(/^$|\d+$/.test(value));
    },
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
  background-color: #1FA2B8;
}

.start:hover,
.start.disabled {
  background-color: #1C92A6;
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
  color: #A4D3DB;
  cursor: not-allowed;
}
</style>
