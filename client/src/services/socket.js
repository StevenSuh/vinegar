/* eslint no-param-reassign: 0 */
const wsCallbacks = [];

const addWsCallbacks = (type, cb) => {
  wsCallbacks.push({ type, cb });
};

export const initSocket = (socket) => {
  socket.sendEvent = function(type, data = {}) {
    this.send(JSON.stringify({ ...data, type }));
  };

  socket.addEventListener('message', (e) => {
    const data = JSON.parse(e.data);
    const { _type } = data;

    const validCbs = wsCallbacks.filter(item => item.type === _type);
    validCbs.forEach(({ cb }) => {
      cb(data);
    });
  });
};

export const socketMixin = {
  mounted() {
    if (this.$options.sockets) {
      Object.keys(this.$options.sockets).forEach(event => {
        const cb = this.$options.sockets[event];
        addWsCallbacks(event, cb.bind(this));
      });
    }
  },
};
