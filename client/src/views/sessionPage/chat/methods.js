export function formatDate(date) {
  const localDate = new Date(date);
  let hour = localDate.getHours();
  let minute = localDate.getMinutes();

  minute = (minute < 10) ? `0${minute}` : minute;
  const amPm = (hour < 12) ? 'AM' : 'PM';
  hour = (hour % 12) ? (hour % 12) : 12;

  return `${hour}:${minute} ${amPm}`;
}

export function onScroll(e) {
  const el = e.target;
  if (this.hasMore && !this.isLoading && el.scrollTop < 50) {
    e.preventDefault();
    this.isLoading = Date.now();
    this.scrollTop = el.scrollTop;
    this.$socket.emit('chat:onChatScroll', { offset: this.msgs.length });
  }

  if (((el.scrollHeight - el.clientHeight) - el.scrollTop) > 0) {
    this.isScrolling = true;
  } else {
    this.isScrolling = false;
  }
}

export function filterMsgs(msgs) {
  return msgs.map((msg, index) => {
    const prevMsg = msgs[index - 1];
    const currMsg = msgs[index];

    if (prevMsg && prevMsg.type !== 'system' && currMsg.type !== 'system') {
      const hasPrev =
        prevMsg.userId === currMsg.userId &&
        prevMsg.name === currMsg.name &&
        prevMsg.color === currMsg.color;
      return { ...msg, hasPrev };
    }
    return msg;
  });
}

export function onInputChange(e) {
  e.preventDefault();
  const { value } = e.target;
  this.inputValue = value;

  this.updateInputHeight();
  this.scrollToBottom();
}

export function onInputKeydown(e) {
  if (!e.shiftKey && e.keyCode === 13) {
    e.preventDefault();
  }
}

export function onInputKeyup(e) {
  if (!e.shiftKey && e.keyCode === 13) {
    e.preventDefault();

    const value = this.inputValue.trim();
    if (value) {
      this.sendChat(value);
    }
  }
}

export function sendChat(value) {
  this.inputValue = '';
  this.$refs.chat.value = '';
  this.updateInputHeight();

  this.$socket.emit('chat:onChatSend', { msg: value });
  this.scrollToBottom();
}

export function scrollToBottom() {
  setTimeout(() => {
    this.$refs.msgs.scrollTop = this.$refs.msgs.scrollHeight;
  }, 0);
}

export function scrollToBottomSmoothly() {
  const { msgs } = this.$refs;
  msgs.scrollTo({
    top: msgs.scrollHeight,
    behavior: 'smooth',
  });
}

export function updateInputHeight() {
  const { chat } = this.$refs;
  chat.removeAttribute('style');
  chat.style.height = `${Math.min(
    chat.scrollHeight + 2,
    this.maxHeight,
  )}px`;
}
