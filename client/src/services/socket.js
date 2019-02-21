/* eslint no-param-reassign: 0 */
import { handleErrorMiddleware } from '@/services/middleware';

const wsCallbacks = [];

const addWsCallbacks = (type, cb) => {
  wsCallbacks.push({ type, cb });
};

export const EmptySocket = () => ({
  sendEvent: () => {
    // handleErrorMiddleware('You are not connected to a session.', 'socket');
  },
  startPingPong: () => {},
  pong: () => {
    // handleErrorMiddleware('You are not connected to a session.', 'socket');
  },
  close: () => {
    handleErrorMiddleware('You are not connected to a session.', 'socket');
  },
});

export const initSocket = (socket) => {
  socket.pong = function() {
    try {
      this.send('pong');
    } catch (e) {
      handleErrorMiddleware(e, 'socket');
    }
  };

  socket.startPingPong = function() {
    clearInterval(this.idleTimeout);
    this.idleTimeout = setInterval(this.pong, 20000);
  }

  socket.sendEvent = function(type, data = {}) {
    if (this.readyState === this.OPEN) {
      try {
        this.send(JSON.stringify({ ...data, type }));
      } catch (e) {
        handleErrorMiddleware(e, 'socket');
      }
      this.startPingPong();
    }
  };

  socket.addEventListener('message', function(e) {
    if (this.readyState === this.OPEN) {
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
      this.startPingPong();
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
