/* eslint no-param-reassign: 0 */
import { handleErrorMiddleware } from '@/services/middleware';

const wsCallbacks = [];

const addWsCallbacks = (type, cb) => {
  wsCallbacks.push({ type, cb });
};

export const initSocket = (socket) => {
  socket.sendEvent = function(type, data = {}) {
    if (socket.readyState === socket.OPEN) {
      this.send(JSON.stringify({ ...data, type }));
    }
  };

  socket.addEventListener('message', (e) => {
    if (socket.readyState === socket.OPEN) {
      let data = '';
      try {
        data = JSON.parse(e.data);
      } catch (err) {
        handleErrorMiddleware(err, 'socket');
      }
      const { _type } = data;

      const validCbs = wsCallbacks.filter(item => item.type === _type);
      validCbs.forEach(({ cb }) => {
        cb(data);
      });
    }
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
