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
      i -= 1;
      break;
    }
    prevOffset = fakeToolbar[i].offsetLeft;
  }

  const open = this.$refs.open.children[0].children;
  for (let j = 0; j < i; j += 1) {
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

  if (i < collapse.length) {
    const parent = this.$refs.toolbar;
    const distance = (parent.offsetWidth - extend.offsetWidth) - (extend.offsetLeft - parent.offsetLeft);

    this.$refs.collapse.style.right = `${distance}px`;
    extend.classList.remove('hide-toolbar');
  } else {
    this.$refs.collapse.removeAttribute('style');
    extend.classList.add('hide-toolbar');
  }
}
