<template>
  <ModalComponent
    :current-step="welcomeStep"
    :on-close="onValidateWelcomeForm"
    :show="showModal"
    :steps="2"
  >
    <div
      slot="modal-1"
      class="modal"
    >
      <form
        class="paddingTop"
        @submit="onWelcomeFormSubmit"
      >
        <h2 class="password-header">
          {{ 'This session is ' }}<span>password-protected</span>{{ '.' }}
        </h2>
        <div class="marginTop">
          <h6 class="input-title">
            Enter the password:
          </h6>
          <InputComponent
            id="password"
            autocomplete="off"
            :error-message="passwordError"
            label="Session Password"
            name="password"
            placeholder="Session Password"
            size="small"
            type="password"
            :value="password"
            @onChange="onPasswordChange"
          />
        </div>
        <div class="button-wrapper marginTop">
          <ButtonComponent type="primary">
            <div class="button">
              <p :class="isLoading ? 'hide' : ''">
                Submit
              </p>
              <Loader
                v-if="isLoading"
                class="loader"
                color="white"
              />
            </div>
          </ButtonComponent>
        </div>
      </form>
    </div>
    <div
      slot="modal-2"
      class="modal"
    >
      <h1 class="welcome-header">
        Welcome!
      </h1>
      <form
        class="paddingTop"
        @submit="onWelcomeFormSubmit"
      >
        <div>
          <h6 class="input-title">
            Enter your name:
          </h6>
          <InputComponent
            id="name"
            autocomplete="off"
            :error-message="nameError"
            label="Your Name"
            name="name"
            placeholder="Your Name"
            size="small"
            :value="name"
            @onChange="onNameChange"
          />
        </div>
        <div class="marginTop small">
          <h6 class="input-title">
            Phone (optional):
          </h6>
          <InputComponent
            id="phone"
            autocomplete="off"
            :error-message="phoneError"
            label="Your Phone"
            max-len="14"
            name="phone"
            placeholder="Your Phone"
            size="small"
            suggestion="We will send you a text to remind you of your turn."
            :on-format="onFormatPhone"
            :on-validate="onValidatePhone"
            :value="phone"
            @onChange="onPhoneChange"
          />
        </div>
        <p class="how-works paddingTop">
          How this works:
        </p>
        <div class="step-wrapper marginTop marginBottom">
          <img
            class="step-img"
            :src="StepOneImg"
            alt="step 1"
          />
          <p class="step-msg">
            Timer will starts once begins and everyone joins.
          </p>
        </div>
        <div class="step-wrapper marginBottom">
          <img
            class="step-img"
            :src="StepTwoImg"
            alt="step 2"
          />
          <p class="step-msg">
            Only begin taking notes if it's your turn! You will also be notified
            through email and/or phone.
          </p>
        </div>
        <div class="step-wrapper">
          <img
            class="step-img"
            :src="StepThreeImg"
            alt="step 3"
          />
          <p class="step-msg">
            Meanwhile, enjoy your class time...by doing anything else you'd
            like!
          </p>
        </div>
        <div class="button-wrapper marginTop">
          <ButtonComponent type="primary">
            <div class="button">
              <p :class="isLoading ? 'hide' : ''">
                Continue
              </p>
              <Loader
                v-if="isLoading"
                class="loader"
                color="white"
              />
            </div>
          </ButtonComponent>
        </div>
      </form>
    </div>
  </ModalComponent>
</template>

<script>
import ButtonComponent from '@/components/button';
import InputComponent from '@/components/input';
import Loader from '@/components/loader';
import ModalComponent from '@/components/modal';

import StepOneImg from '@/assets/step1.png';
import StepTwoImg from '@/assets/step2.png';
import StepThreeImg from '@/assets/step3.png';

import { connectErrorMiddlewareWithCallback } from '@/services/middleware';

import {
  onFormatPhone,
  onInit,
  onValidatePhone,
  onValidateWelcomeForm,
  onWelcomeFormSubmit,
} from './utils';

export default {
  components: {
    ButtonComponent,
    InputComponent,
    Loader,
    ModalComponent,
  },
  props: {
    onClose: Function,
    onShow: Function,
  },
  data() {
    return {
      // state
      isLoading: false,
      name: '',
      nameError: '',
      password: '',
      passwordError: '',
      phone: '',
      phoneError: '',
      showModal: false,
      welcomeStep: 0,

      // assets
      StepOneImg,
      StepTwoImg,
      StepThreeImg,
    };
  },
  created() {
    connectErrorMiddlewareWithCallback(this, () => {
      this.isLoading = false;
    });
  },
  mounted() {
    this.onInit();
  },
  methods: {
    onInit,
    onNameChange(value) {
      this.name = value;
    },
    onPasswordChange(value) {
      this.password = value;
    },
    onValidatePhone,
    onValidateWelcomeForm,
    onWelcomeFormSubmit,
    onPhoneChange(value) {
      this.phone = value;
    },
    onFormatPhone,
    onShowModal() {
      this.showModal = true;
      this.onShow();
    },
  },
};
</script>

<style scoped>
.modal {
  padding: 40px 60px;
  position: relative !important;
  min-width: 600px;
  width: 30vw;
}

.welcome-header {
  color: var(--main-font-color);
  font-weight: 500;
  font-size: 36px;
  text-align: center;
}

.password-header {
  font-weight: 400;
  font-size: 24px;
  padding-bottom: 10px;
  text-align: center;
}

.password-header > span {
  font-weight: 500;
}

.input-title {
  font-size: 15px;
  font-weight: 400;
  margin-bottom: 8px;
}

.button {
  padding: 4px 6px;
}

.button-wrapper {
  text-align: center;
}

.loader {
  left: calc(50% - 12px);
  padding: 0;
  position: absolute !important;
  top: calc(50% - 12px);
}

.how-works {
  font-size: 18px;
}

.step-wrapper {
  align-content: center;
  display: flex;
  flex-direction: row;
}

.step-wrapper.marginBottom {
  margin-bottom: 10px;
}

.step-wrapper.marginTop {
  margin-top: 5px;
}

.step-img {
  height: 50px;
  width: 50px;
}

.step-msg {
  display: inline-block;
  font-size: 14px;
  left: 50px;
  line-height: 1.5em;
  margin: auto;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: calc(100% - 50px);
}
</style>
