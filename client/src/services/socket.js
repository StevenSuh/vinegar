/* eslint no-param-reassign: 0 */
import { handleErrorMiddleware } from '@/services/middleware';

const wsCallbacks = [];

const addWsCallbacks = (type, cb) => {
  wsCallbacks.push({ type, cb });
};

export const EmptySocket = () => ({
  close: () => handleErrorMiddleware('You are not connected to a session.', 'socket'),
  pong: () => {},
  sendEvent: () => {},
  startPingPong: () => {},
});

export const initSocket = (socket) => {
  socket.idleTimeout = null;

  socket.pong = function() {
    try {
      this.send('pong');
    } catch (e) {
      handleErrorMiddleware(e, 'socket');
    }
  };

  socket.startPingPong = function() {
    clearInterval(this.idleTimeout);
    this.idleTimeout = setInterval(this.pong, 20000); // disconnects after 30 sec of idle
  };

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

  const onMessage = function(e) {
    if (this.readyState === this.OPEN) {
      if (e.data === 'ping') {
        return;
      }

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
  };

  socket.pong = socket.pong.bind(socket);
  socket.startPingPong = socket.startPingPong.bind(socket);
  socket.sendEvent = socket.sendEvent.bind(socket);
  socket.addEventListener('message', onMessage.bind(socket));
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
