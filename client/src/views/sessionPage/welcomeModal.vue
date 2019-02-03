<template>
  <ModalComponent
    :currentStep="welcomeStep"
    :isLoading="initial"
    :steps="2"
  >
    <div class="modal" slot="modal-1">
      <form
        class="paddingTop"
        v-on:submit="onWelcomeFormSubmit"
      >
        <h1 class="welcome-header">
          Welcome!
        </h1>
        <div class="marginTop small">
          <h6 class="input-title">
            Password:
          </h6>
          <InputComponent
            autocomplete="off"
            :error-message="passwordError"
            label="Password"
            max-len="14"
            name="password"
            placeholder="Password"
            size="small"
            type="password"
            :value="password"
            v-on:onChange="onPasswordChange"
          />
        </div>
        <div class="button-wrapper marginTop">
          <ButtonComponent type="primary">
            <div class="button">
              <p :class="isLoading ? 'hide' : ''">Submit</p>
              <Loader class="loader" color="white" v-if="isLoading" />
            </div>
          </ButtonComponent>
        </div>
      </form>
    </div>
    <div class="modal" slot="modal-2">
      <h1 class="welcome-header">
        Welcome!
      </h1>
      <form
        class="paddingTop"
        v-on:submit="onWelcomeFormSubmit"
      >
        <div>
          <h6 class="input-title">
            Enter your name:
          </h6>
          <InputComponent
            autocomplete="off"
            :error-message="nameError"
            label="Name"
            name="name"
            placeholder="Your name"
            size="small"
            :value="name"
            v-on:onChange="onNameChange"
          />
        </div>
        <div class="marginTop small">
          <h6 class="input-title">
            Phone (optional):
          </h6>
          <InputComponent
            autocomplete="off"
            :error-message="phoneError"
            label="Phone"
            max-len="14"
            name="phone"
            placeholder="Your phone"
            size="small"
            suggestion="We will send you a text to remind you of your turn."
            :on-validate="onValidatePhone"
            :value="phone"
            v-on:onChange="onPhoneChange"
          />
        </div>
        <p class="how-works paddingTop">
          How this works:
        </p>
        <div class="step-wrapper marginTop marginBottom">
          <img class="step-img" :src="StepOneImg" alt="step 1" />
          <p class="step-msg">
            Timer will starts once begins and everyone joins.
          </p>
        </div>
        <div class="step-wrapper marginBottom">
          <img class="step-img" :src="StepTwoImg" alt="step 2" />
          <p class="step-msg">
            Only begin taking notes if it's your turn! You will also be notified
            through email and/or phone.
          </p>
        </div>
        <div class="step-wrapper">
          <img class="step-img" :src="StepThreeImg" alt="step 3" />
          <p class="step-msg">
            Meanwhile, enjoy your class time...by doing anything else you'd like!
          </p>
        </div>
        <div class="button-wrapper marginTop">
          <ButtonComponent type="primary">
            <div class="button">
              <p :class="isLoading ? 'hide' : ''">Continue</p>
              <Loader class="loader" color="white" v-if="isLoading" />
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
import {
  onFormatPhone,
  onValidatePhone,
  onValidateWelcomeForm,
  onWelcomeFormSubmit,
} from './utils';
import { getAuthStatus } from '@/services/api';

import StepOneImg from '@/assets/step1.png';
import StepTwoImg from '@/assets/step2.png';
import StepThreeImg from '@/assets/step3.png';

export default {
  components: {
    ButtonComponent,
    InputComponent,
    Loader,
    ModalComponent,
  },
  methods: {
    async onInit() {
      const {
        validSession,
        validUser,
      } = await getAuthStatus();

      if (validSession) {
        // call api again to get data
        this.$socket.emit('socket:onEnter', { color, name });
        return;
      }

      if (!validUser) {
        this.$router.push('/');
        return;
      }

      // call api to see if room is password protected
      this.initial = false;
    },
    onNameChange(value) {
      this.name = value;
    },
    onPasswordChange(value) {
      this.password = value;
    },
    onValidatePhone,
    onValidateWelcomeForm,
    onWelcomeFormSubmit,
    onPhoneChange: onFormatPhone,
  },
  mounted() {
    this.onInit();
  },
  props: {
    onClose: Function,
  },
  data() {
    return {
      // state
      initial: true,
      isLoading: false,
      name: '',
      nameError: '',
      password: '',
      passwordError: '',
      phone: '',
      phoneError: '',
      welcomeStep: 0,

      // assets
      StepOneImg,
      StepTwoImg,
      StepThreeImg,
    };
  },
  sockets: {
    'socket:onEnter': function() {
      this.onClose();
    },
  },
}
</script>

<style scoped>
.modal {
  padding: 40px 60px;
  position: relative !important;
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

.button {
  padding: 4px 6px;
}

.button-wrapper {
  text-align: center;
}

.hide {
  opacity: 0;
  pointer-events: none;
  user-select: none;
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
