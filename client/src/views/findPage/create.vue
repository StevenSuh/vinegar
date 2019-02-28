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
          id="school-name"
          :error-message="schoolNameError"
          label="School Name"
          name="schoolName"
          placeholder="School Name"
          type="text"
          :value="schoolName"
          @onChange="onSchoolNameChange"
        />
        <InputComponent
          id="session-name"
          class="marginTop smaller"
          :error-message="sessionNameError"
          label="Session Name"
          name="sessionName"
          placeholder="Session Name"
          suggestion="Example: &quot;CMPS 101&quot;"
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
            id="hour"
            autocomplete="off"
            :error-message="hourError"
            label="Hour"
            max-len="2"
            name="hour"
            placeholder="Hour"
            type="text"
            :value="hour"
            :on-validate="onNumberValidate"
            @onChange="onHourChange"
          />
          <InputComponent
            id="minute"
            autocomplete="off"
            :error-message="minuteError"
            label="Minute"
            max-len="2"
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
          id="password"
          autocomplete="off"
          :error-message="passwordError"
          label="Password"
          name="password"
          placeholder="Password"
          type="password"
          :value="password"
          @onChange="onPasswordChange"
        />
      </div>
      <div class="button-wrapper marginTop small">
        <ButtonComponent type="primary">
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
import { connectErrorMiddlewareWithCallback } from '@/services/middleware';

import { ALLOWED_CHARACTERS, MIN_PASSWORD_LENGTH } from '@/defs';

const regex = new RegExp(`^[${ALLOWED_CHARACTERS.join('')}]+$`);

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
  created() {
    connectErrorMiddlewareWithCallback(this, () => {
      this.isLoading = false;
    });
  },
  methods: {
    async onCreateFormSubmit(e) {
      e.preventDefault();
      const hasError = this.onFormValidate();

      if (hasError) {
        return;
      }

      this.isLoading = true;

      await createSession({
        hour: parseInt(this.hour, 10),
        minute: parseInt(this.minute, 10),
        password: this.password,
        schoolName: this.schoolName,
        sessionName: this.sessionName,
      });
      this.isLoading = false;

      this.$router.push(`/app/session/${this.schoolName}/${this.sessionName}`);
    },
    onFormValidate() {
      if (this.schoolName) {
        this.schoolNameError = regex.test(this.schoolName)
          ? ''
          : `You may only use characters from this set: ${ALLOWED_CHARACTERS.join(
              ' ',
            )}.`;
      } else {
        this.schoolNameError = 'This field is required.';
      }

      if (this.sessionName) {
        this.sessionNameError = regex.test(this.sessionName)
          ? ''
          : `You may only use characters from this set: ${ALLOWED_CHARACTERS.join(
              ' ',
            )}.`;
      } else {
        this.sessionNameError = 'This field is required.';
      }

      if (this.hour) {
        this.hourError = !Number.isNaN(this.hour)
          ? ''
          : 'This field must be a number.';
      } else {
        this.hourError = 'This field is required.';
      }

      if (this.minute) {
        this.minuteError = !Number.isNaN(this.minute)
          ? ''
          : 'This field must be a number.';
      } else {
        this.minuteError = 'This field is required.';
      }

      if (this.password) {
        this.passwordError =
          this.password.length >= MIN_PASSWORD_LENGTH
            ? ''
            : `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
      } else {
        this.passwordError = '';
      }

      return (
        this.schoolNameError ||
        this.sessionNameError ||
        this.hourError ||
        this.minuteError ||
        this.passwordError
      );
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
  margin-left: -1px;
  border-top-left-radius: 0px !important;
  border-bottom-left-radius: 0px !important;
}
</style>
