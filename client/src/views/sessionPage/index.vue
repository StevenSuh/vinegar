<template>
  <transition name="fade">
    <div
      v-if="show"
      class="session"
    >
      <Editor
        :session="$route.params.session"
        :school="$route.params.school"
      />
      <Chat />
      <transition name="fadeNoDelay">
        <ModalComponent
          v-if="isWelcome"
          :on-close="onCloseIsWelcome"
        >
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
      </transition>
    </div>
  </transition>
</template>

<script>
import Editor from '@/views/sessionPage/editor';
import Vue from 'vue';
import VueSocketIO from 'vue-socket.io';
import Chat from '@/views/sessionPage/chat';

import InputComponent from '@/components/input';
import ModalComponent from '@/components/modal';
import { onFormatPhone, onValidatePhone } from './utils';

export default {
  components: {
    Editor,
    Chat,
    InputComponent,
    ModalComponent,
  },
  data() {
    return {
      // state
      show: false,
      isWelcome: true,
      welcomeName: '',
      welcomeNameError: '',
      welcomePhone: '',
      welcomePhoneError: '',
    };
  },
  beforeCreate() {
    Vue.use(new VueSocketIO({ connection: '/' }));
  },
  mounted() {
    this.show = true;
  },
  methods: {
    onCloseIsWelcome() {
      this.isWelcome = false;
    },
    onValidatePhone,
    onWelcomeFormSubmit(e) {
      e.preventDefault();
    },
    onWelcomeNameChange(value) {
      this.welcomeName = value;
    },
    onWelcomePhoneChange: onFormatPhone,
  },
  sockets: {},
};
</script>

<style scoped>
.session {
  height: 100vh;
}

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
