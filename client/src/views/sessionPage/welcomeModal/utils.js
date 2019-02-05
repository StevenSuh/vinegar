import {
  enterSession,
  getAuthStatus,
  getSessionPasswordStatus,
  getUserSessionInfo,
  validateSessionPassword,
} from '@/services/api';

export async function onInit() {
  /**
   * Check user's cookies to validate its sign-in + session check-in status
   * - If not signed in, re-route to home page
   * - If session checked in, skip the welcome intro flow
   * - If session has password, enable password check modal first
   */
  const {
    validSession,
    validUser,
  } = await getAuthStatus();

  if (!validUser) {
    return this.$router.push('/');
  }

  if (validSession) {
    // this means that user already went through the session welcome flow
    // (potentially revisiting from different device/browser)
    const { color, name } = await getUserSessionInfo();
    if (!color || !name) {
      this.welcomeStep += 1;
      this.onShow();
      return;
    }

    return this.onClose({ color, name });
  }

  const { hasPassword } = await getSessionPasswordStatus();
  if (!hasPassword) {
    this.welcomeStep += 1;
  }

  this.onShow();
}

export function onValidateWelcomeForm() {
  let hasError = false;

  switch (this.welcomeStep) {
    case 0: {
      if (!this.password) {
        this.passwordError = 'This field is required.';
        hasError = true;
      } else {
        this.passwordError = '';
      }
      break;
    }
    case 1:
    default: {
      if (!this.name) {
        this.nameError = 'This field is required.';
        hasError = true;
      } else {
        this.nameError = '';
      }

      if (this.phone && !/[(]\d{3}[)][ ]\d{3}[-]\d{4}/.test(this.phone)) {
        this.phoneError = 'Phone number must be in format: (XXX) XXX-XXXX.';
        hasError = true;
      } else {
        this.phoneError = '';
      }
      break;
    }
  }
  return hasError;
}

export async function onWelcomeFormSubmit(e) {
  e.preventDefault();

  if (this.isLoading) {
    return;
  }

  const hasError = this.onValidateWelcomeForm();
  if (hasError) {
    return;
  }

  switch (this.welcomeStep) {
    // first modal step
    case 0: {
      this.isLoading = true;
      const { validPassword } = await validateSessionPassword(this.password);
      this.isLoading = false;

      if (!validPassword) {
        this.passwordError = 'The password is incorrect. Try again?';
        break;
      }

      // check to see if user already has a color/name
      const { color, name } = await getUserSessionInfo();
      if (color && name) {
        this.onClose({ color, name });
        break;
      }

      this.password = '';
      this.passwordError = '';
      this.welcomeStep += 1;
      break;
    }
    // second modal step
    case 1:
    default: {
      this.isLoading = true;
      const { color } = await enterSession({
        name: this.name,
        phone: this.phone,
      });

      // TODO: get session info

      this.isLoading = false;
      return this.onClose({ color, name: this.name });
    }
  }
}

export function onFormatPhone(value) {
  const match = value.match(/\d+/g) || [];
  const numberValue = match.join('');

  switch (numberValue.length) {
    case 0:
      this.phone = '';
      return;
    case 1:
    case 2:
      this.phone = `(${numberValue}`;
      break;
    case 3:
      if (this.phone.length === 7 || this.phone.length === 6) {
        this.phone = `(${numberValue.slice(0, 3)}`;
        break;
      }
      // falls through
    case 4:
    case 5:
      this.phone = `(${numberValue.slice(0, 3)}) ${numberValue.slice(3)}`;
      break;
    case 6:
      if (this.phone.length === 11 || this.phone.length === 10) {
        this.phone = `(${numberValue.slice(0, 3)}) ${numberValue.slice(3, 6)}`;
        break;
      }
      // falls through
    case 7:
    case 8:
    case 9:
    case 10:
      this.phone = `(${numberValue.slice(0, 3)}) ${numberValue.slice(3, 6)}-${numberValue.slice(6)}`;
      break;
    default:
      this.phone = `(${numberValue.slice(0, 3)}) ${numberValue.slice(3, 6)}-${numberValue.slice(6, 10)}`;
      break;
  }
  this.$forceUpdate();
}

const phoneRegex = new RegExp('^$|^[0-9]+$');

export function onValidatePhone(value) {
  const last = value[value.length - 1];

  if (last === '(' && value.length === 1) {
    return true;
  }
  if (last === ')' && value.length === 5) {
    return true;
  }
  if (last === ' ' && value.length === 6) {
    return true;
  }
  if (last === '-' && value.length === 10) {
    return true;
  }
  return Boolean(phoneRegex.exec(last || ''));
}
