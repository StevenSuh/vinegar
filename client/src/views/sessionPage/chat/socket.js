export function onEnter({ hasMore, msgs }) {
  const msgsFormatted = msgs.map(msg => ({
    ...msg,
    date: this.formatDate(msg.date),
  }));
  this.msgs = this.filterMsgs(msgsFormatted);

  this.hasMore = hasMore;
  this.$refs.chat.disabled = false;
  this.scrollToBottom();
}

export function onChatSend(data) {
  const { msgs } = this.$refs;
  const isAtBottom = (msgs.scrollHeight - msgs.clientHeight) === msgs.scrollTop;

  const dataFormatted = {
    ...data,
    date: this.formatDate(data.date),
  };
  const lastItem = this.msgs.pop();
  this.msgs = this.msgs.concat(this.filterMsgs([lastItem, dataFormatted]));

  if (isAtBottom) {
    this.scrollToBottom();
  }
}

export function onChatScroll({ hasMore, msgs }) {
  const msgsFormatted = msgs.map(msg => ({
    ...msg,
    date: this.formatDate(msg.date),
  }));
  const filtered = this.filterMsgs(msgsFormatted.concat(this.msgs[0]));
  this.msgs = filtered.concat(this.msgs.slice(1));

  const loadTime = Date.now() - this.isLoading;
  const timeout = (loadTime < 500) ? 300 : 0;

  // wait for this.msgs to update view
  setTimeout(() => {
    const msgsWrapper = this.$refs.msgs;
    const currentChild = msgsWrapper.children[msgs.length];
    this.$refs.msgs.scrollTop = currentChild.offsetTop + this.scrollTop;

    this.scrollTop = 0;
    this.hasMore = hasMore;
    this.isLoading = null;
  }, timeout);
}
