<template>
  <Modal
    :on-close="onClose"
    :on-esc="onClose"
    :open="isOpen"
  >
    <div class="delete-modal">
      <div class="msg-wrapper">
        <span v-html="AlertCircleIcon" />
        <p class="delete-msg marginLeft small">
          {{ 'Are you sure you want to remove ' }}
          <span class="bold inline-block"> {{ name }} </span>{{ '?' }}
        </p>
      </div>
      <div class="button-wrapper marginTop small">
        <button-component
          class="hover"
          type="minimal"
          size="small"
        >
          <p @click="onClose">
            Cancel
          </p>
        </button-component>
        <ButtonComponent
          type="primary"
          size="small"
        >
          <p @click="onDelete(id);">
            Remove
          </p>
        </ButtonComponent>
      </div>
    </div>
  </Modal>
</template>

<script>
import ButtonComponent from '@/components/button';
import Modal from '@/components/modal';

import AlertCircleIcon from '!raw-loader!@/assets/alert-circle.svg';

export default {
  components: {
    ButtonComponent,
    Modal,
  },
  props: {
    isOpen: Boolean,
    name: String,
    id: Number,
    onClose: Function,
    onDelete: Function,
  },
  data() {
    return {
      AlertCircleIcon,
    };
  },
};
</script>

<style scoped>
.delete-modal {
  padding: 20px 25px;
  position: relative !important;
  max-width: 350px;
}

.msg {
  align-items: flex-start;
  display: flex;
}

.delete-msg {
  line-height: 1.4em;
}

.msg-wrapper {
  display: flex;
  align-items: center;
}

.button-wrapper {
  align-items: center;
  display: flex;
  justify-content: flex-end;
}

.bold {
  font-weight: 500;
}

.inline-block {
  display: inline-block;
}
</style>
