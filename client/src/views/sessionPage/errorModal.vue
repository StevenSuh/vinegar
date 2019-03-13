<template>
  <Modal>
    <div class="error-modal">
      <h2 class="error-header">
        {{ errorModal.header }}
      </h2>
      <p class="error-msg marginTop small">
        {{ errorModal.msg }}
      </p>
      <ButtonComponent
        class="error-button"
        type="primary"
      >
        <router-link
          tag="a"
          to="/app/find"
        >
          Back
        </router-link>
      </ButtonComponent>
    </div>
  </Modal>
</template>

<script>
import ButtonComponent from '@/components/button';
import Modal from '@/components/modal';

export default {
  components: {
    ButtonComponent,
    Modal,
  },
  props: {
    errorModal: Object,
  },
};
</script>

<style scoped>
.error-modal {
  padding: 40px 60px;
  position: relative !important;
  min-width: 600px;
  text-align: center;
  width: 30vw;
}

@media (max-width: 600px) {
  .error-modal {
    min-width: unset;
    padding: 20px;
    width: 100vw;
  }
}

.error-header {
  font-weight: 500;
}

.error-msg {
  line-height: 1.4em;
}

.error-button {
  margin-top: 30px;
}
</style>
