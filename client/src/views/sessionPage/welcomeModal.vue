<template>
  <ModalComponent :on-close="onClose">
    <div class="modal">
      <h1 class="welcome-header">
        Welcome!
      </h1>
      <form
        class="paddingTop paddingBottom"
        @submit="onWelcomeFormSubmit"
      >
        <div>
          <h6 class="input-title">
            Enter your name:
          </h6>
          <InputComponent
            autocomplete="off"
            :error-message="welcomeNameError"
            label="Name"
            name="name"
            placeholder="Your name"
            size="small"
            :value="welcomeName"
            @onChange="onWelcomeNameChange"
          />
        </div>
        <div class="marginTop small">
          <h6 class="input-title">
            Phone (optional):
          </h6>
          <InputComponent
            autocomplete="off"
            :error-message="welcomePhoneError"
            label="Phone"
            max-len="14"
            name="phone"
            placeholder="Your phone"
            size="small"
            :on-validate="onValidatePhone"
            :value="welcomePhone"
            @onChange="onWelcomePhoneChange"
          />
        </div>
      </form>
    </div>
  </ModalComponent>
</template>

<script>
import InputComponent from '@/components/input';
import ModalComponent from '@/components/modal';
import { onFormatPhone, onValidatePhone } from './utils';

export default {
  components: {
    InputComponent,
    ModalComponent,
  },
  methods: {
    onValidatePhone,
    onWelcomeFormSubmit(e) {
      e.preventDefault();
    },
    onWelcomeNameChange(value) {
      this.welcomeName = value;
    },
    onWelcomePhoneChange: onFormatPhone,
  },
  props: {
    onClose: Function,
  },
  data() {
    return {
      welcomeName: '',
      welcomeNameError: '',
      welcomePhone: '',
      welcomePhoneError: '',
    };
  },
}
</script>

<style scoped>
.modal {
  padding: 40px 60px;
  width: 600px;
}

.welcome-header {
  color: var(--main-font-color);
  font-weight: 500;
  font-size: 36px;
  text-align: center;
}

.input-title {
  font-size: 15px;
  font-weight: 400;
  margin-bottom: 8px;
}
</style>
