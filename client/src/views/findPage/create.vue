<template>
  <div class="create-wrapper">
    <h2 class="create-header paddingTop small">
      Create a Session
    </h2>
    <p class="create-message paddingBottom paddingTop small">
      Create a room and begin enjoying your class.
    </p>
    <div class="paddingBottom smaller" />
    <form @submit="onCreateFormSubmit">
    <div class="form-wrapper paddingBottom smaller">
      <h6 class="form-title">
        Names
      </h6>
      <InputComponent
        :error-message="schoolNameError"
        id="school-name"
        label="School"
        name="schoolName"
        placeholder="School Name"
        type="text"
        :value="schoolName"
        @onChange="onSchoolNameChange"
      />
      <InputComponent
        class="marginTop smaller"
        :error-message="sessionNameError"
        id="session-name"
        label="Session"
        name="sessionName"
        placeholder="Session Name"
        suggestion='Example: "CMPS 101"'
        type="text"
        :value="sessionName"
        @onChange="onSessionNameChange"
      />
    </div>
    <div class="form-wrapper paddingBottom paddingTop small">
      <h6 class="form-title">
        Duration
      </h6>
      <div class="input-divider">
        <InputComponent
          autocomplete="off"
          :error-message="hourError"
          id="hour"
          label="Hour"
          maxLen="2"
          name="hour"
          placeholder="Hour"
          type="text"
          :value="hour"
          :on-validate="onNumberValidate"
          @onChange="onHourChange"
        />
        <InputComponent
          autocomplete="off"
          :error-message="minuteError"
          id="minute"
          label="Minute"
          maxLen="2"
          name="minute"
          placeholder="Minute"
          type="text"
          :value="minute"
          :on-validate="onNumberValidate"
          @onChange="onMinuteChange"
        />
      </div>
    </div>
    <div class="form-wrapper paddingBottom paddingTop smaller">
      <h6 class="form-title">
        Password (Optional)
      </h6>
      <InputComponent
        autocomplete="off"
        :error-message="passwordError"
        id="password"
        label="Password"
        name="password"
        placeholder="Password"
        type="password"
        :value="password"
        @onChange="onPasswordChange"
      />
    </div>
    <div class="button-wrapper marginTop small">
      <ButtonComponent type="primary" size="small">
        <div class="create-button">
          <p :class="isLoading ? 'hide' : ''">
            Create
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
</template>

<script>
import ButtonComponent from '@/components/button';
import InputComponent from '@/components/input';
import Loader from '@/components/loader';
import { createSession } from '@/services/api';

import { MIN_PASSWORD_LENGTH } from '@/defs';

export default {
  components: {
    ButtonComponent,
    InputComponent,
    Loader,
  },
  data() {
    return {
      // state
      isLoading: false,
      hour: null,
      hourError: '',
      minute: null,
      minuteError: '',
      password: '',
      passwordError: '',
      schoolName: '',
      schoolNameError: '',
      sessionName: '',
      sessionNameError: '',
    };
  },
  methods: {
    async onCreateFormSubmit(e) {
      e.preventDefault();
      const hasError = this.onFormValidate();

      if (hasError) {
        return;
      }

      this.isLoading = true;
      const hour = parseInt(this.hour, 10);
      const minute = parseInt(this.minute, 10);
      const duration = (hour * 60) + minute;

      await createSession({
        duration,
        password: this.password,
        schoolName: this.schoolName,
        sessionName: this.sessionName,
      });
      this.isLoading = false;

      this.$router.push(`/session/${this.schoolName}/${this.sessionName}`);
    },
    onFormValidate() {
      this.schoolNameError = !this.schoolName ?
        'This field is required.' : '';

      this.sessionNameError = !this.sessionName ?
        'This field is required.' : '';

      this.hourError = !this.hour ?
        'This field is required.' :
        !isNaN(this.hour) ? '' :
          'This field must be a number.';

      this.minuteError = !this.minute ?
        'This field is required.' :
        !isNaN(this.minute) ? '' :
          'This field must be a number.';

      this.passwordError = !this.password ?
        '' : this.password.length < MIN_PASSWORD_LENGTH ?
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` : '';

      return this.schoolNameError ||
        this.sessionNameError ||
        this.hourError ||
        this.minuteError ||
        this.passwordError;
    },
    onHourChange(value) {
      this.hour = value;
    },
    onMinuteChange(value) {
      this.minute = value;
    },
    onNumberValidate(value) {
      return Boolean(/^$|\d+$/.test(value));
    },
    onPasswordChange(value) {
      this.password = value;
    },
    onSchoolNameChange(value) {
      this.schoolName = value;
    },
    onSessionNameChange(value) {
      this.sessionName = value;
    },
  },
};
</script>

<style scoped>
.create-wrapper {
  width: 100%;
}

.create-header {
  font-size: 38px;
  font-weight: 500;
  text-align: center;
}

.create-message {
  font-size: 18px;
  text-align: center;
}

.create-button {
  padding: 12px 35px;
}

.form-wrapper {
  margin: auto;
  width: 75%;
}

.form-title {
  letter-spacing: 0.3px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.searchResult {
  top: -25px;
}

.input-divider {
  display: flex;
  flex-direction: row;
  width: 100%;
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
</style>

<style>
.search-expanded input {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

#hour {
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

#minute {
  border-left-width: 0;
  border-top-left-radius: 0px !important;
  border-bottom-left-radius: 0px !important;
}
</style>
