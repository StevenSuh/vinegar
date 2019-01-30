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

export function onFormatPhone(value) {
  const match = value.match(/\d+/g) || [];
  const numberValue = match.join('');

  switch (numberValue.length) {
    case 0:
      this.welcomePhone = '';
      return;
    case 1:
    case 2:
      this.welcomePhone = `(${numberValue}`;
      break;
    case 3:
      if (this.welcomePhone.length === 7 || this.welcomePhone.length === 6) {
        this.welcomePhone = `(${numberValue.slice(0, 3)}`;
        break;
      }
      // falls through
    case 4:
    case 5:
      this.welcomePhone = `(${numberValue.slice(0, 3)}) ${numberValue.slice(3)}`;
      break;
    case 6:
      if (this.welcomePhone.length === 11) {
        this.welcomePhone = `(${numberValue.slice(0, 3)}) ${numberValue.slice(3, 6)}`;
        break;
      }
      // falls through
    case 7:
    case 8:
    case 9:
    case 10:
      this.welcomePhone = `(${numberValue.slice(0, 3)}) ${numberValue.slice(3, 6)}-${numberValue.slice(6)}`;
      break;
    default:
      this.welcomePhone = `(${numberValue.slice(0, 3)}) ${numberValue.slice(3, 6)}-${numberValue.slice(6, 10)}`;
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
