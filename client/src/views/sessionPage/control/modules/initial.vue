<template>
  <div class="wrapper paddingTop">
    <form
      class="initial-wrapper"
      @submit="onStart"
    >
      <input-component
        v-if="isOwner"
        class="participants-input"
        id="participantsNumId"
        autocomplete="off"
        name="participants"
        placeholder="# of participants"
        size="x-small"
        :error-message="participantsError"
        :value="participants"
        :on-validate="onValidateNumber"
        @onChange="onChangeParticipants"
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
      <invite-button />
    </form>
    <div class="initial-text">
      <span class="bold">
        Session ends in:
      </span>
      {{ formatDuration(duration) }}
    </div>
  </div>
</template>

<script>
import ButtonComponent from '@/components/button';
import InputComponent from '@/components/input';
import InviteButton from '@/views/sessionPage/control/components/inviteButton';

import { formatDuration } from '@/views/sessionPage/control/utils';

export default {
  components: {
    ButtonComponent,
    InputComponent,
    InviteButton,
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
    onStart(e) {
      e.preventDefault();
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
  background-color: #1fa2b8;
}

.start:hover,
.start.disabled {
  background-color: #1c92a6;
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
  color: #a4d3db;
  cursor: not-allowed;
}

.participants-input {
  width: 124px;
}
</style>
