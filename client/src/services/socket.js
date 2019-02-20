/* eslint no-param-reassign: 0 */
import { handleErrorMiddleware } from '@/services/middleware';

const wsCallbacks = [];

const addWsCallbacks = (type, cb) => {
  wsCallbacks.push({ type, cb });
};

export const EmptySockert = () => ({
  sendEvent: type => {
    handleErrorMiddleware(type, 'socket');
  },
  pong: () => {
    handleErrorMiddleware('pong', 'socket');
  },
});

export const initSocket = (socket) => {
  socket.sendEvent = function(type, data = {}) {
    if (socket.readyState === socket.OPEN) {
      try {
        this.send(JSON.stringify({ ...data, type }));
      } catch (e) {
        handleErrorMiddleware(e, 'socket');
      }
    }
  };

  socket.pong = function() {
    try {
      this.send('pong');
    } catch (e) {
      handleErrorMiddleware(e, 'socket');
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
