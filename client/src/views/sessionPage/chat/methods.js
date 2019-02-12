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
