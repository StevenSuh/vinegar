import { enterSession } from '@/services/api';
import Quill from 'quill';

const Delta = Quill.import('delta');

export function codeBlockIndentHandler(indent) {
  return {
    key: 9,
    shiftKey: !indent,
    format: { 'code-block': true },
    handler(range) {
      const text = '  ';

      const delta = new Delta()
        .retain(range.index)
        .delete(range.length)
        .insert(text);
      const index = text.length + range.index;
      const length = 0;

      this.quill.updateContents(delta, Quill.sources.USER);
      this.quill.setSelection(index, length, Quill.sources.USER);
    },
  };
}

export function onValidateWelcomeForm() {
  let hasError = false;

  if (!this.name) {
    this.nameError = 'This field is required.';
    hasError = true;
  }
  if (this.phone && !/[(]\d{3}[)][ ]\d{3}[-]\d{4}/.test(this.phone)) {
    this.phoneError = 'Invalid phone format.';
    hasError = true;
  }

  return hasError;
}

export async function onWelcomeFormSubmit(e) {
  e.preventDefault();

  if (!this.isLoading) {
    switch (this.welcomeStep) {
      case 0: {
        this.isLoading = true;

        setTimeout(() => {
          this.welcomeStep += 1;
          this.isLoading = false;
        }, 2000);

        break;
      }
      case 1:
      default: {
        const hasError = this.onValidateWelcomeForm();

        if (!hasError) {
          this.nameError = '';
          this.phoneError = '';

          this.isLoading = true;

          const { color } = await enterSession({
            name: this.name,
            password: this.password,
            phone: this.phone,
            school: this.school,
            session: this.session,
          });

          this.isLoading = false;
          this.$socket.emit('socket:onEnter', { color, name: this.name });
        }
        break;
      }
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

export function onResizeCollapse() {
  /*
    fakeToolbar is hidden on DOM. However, it maintains DOM properties such as `offsetLeft`.
    Therefore, this is taking advantage of its DOM position properties to make decision on
    which items to collapse for the editor's toolbar
  */
  const fakeToolbar = this.$refs.fakeToolbar.children[0].children;
  let prevOffset = fakeToolbar[0].offsetLeft;

  let i = 1;
  for (; i < fakeToolbar.length; i += 1) {
    if (fakeToolbar[i].offsetLeft < prevOffset) {
      break;
    }
    prevOffset = fakeToolbar[i].offsetLeft;
  }

  const open = this.$refs.open.children[0].children;
  for (let j = 1; j < i; j += 1) {
    open[j].classList.remove('hide-toolbar');
  }
  for (let j = i; j < open.length; j += 1) {
    open[j].classList.add('hide-toolbar');
  }

  const collapse = this.$refs.collapse.children[0].children;
  for (let j = 0; j < i; j += 1) {
    collapse[j].classList.add('hide-toolbar');
  }
  for (let j = i; j < collapse.length; j += 1) {
    collapse[j].classList.remove('hide-toolbar');
  }

  const { extend } = this.$refs;
  const collapseEl = this.$refs.collapse;

  if (i < collapse.length) {
    const parent = this.$refs.toolbar;
    const distance = (parent.offsetWidth - extend.offsetWidth) - (extend.offsetLeft - parent.offsetLeft);

    collapseEl.style.right = `${distance}px`;
    extend.classList.remove('hide-toolbar');
  } else {
    collapseEl.removeAttribute('style');
    extend.classList.add('hide-toolbar');
  }
}
