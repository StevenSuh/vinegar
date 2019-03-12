/* eslint no-param-reassign: 0 */
import { handleErrorMiddleware } from '@/services/middleware';

const wsCallbacks = [];

const addWsCallbacks = (type, cb) => {
  wsCallbacks.push({ type, cb });
};

export const EmptySocket = {
  addEventListener: () => {},
  empty: true,
  close: () => handleErrorMiddleware('You are not connected to a session.', 'socket'),
  closeSocket: () => {},
  pong: () => {},
  sendEvent: () => {},
  startPingPong: () => {},
};

export const initSocket = (socket) => {
  socket.idleTimeout = null;

  socket.closeSocket = function() {
    clearInterval(this.idleTimeout);
    this.close();

    Object.keys(EmptySocket).forEach(key => {
      this[key] = EmptySocket[key];
    });
  };

  socket.pong = function() {
    if (this.readyState === this.OPEN) {
      try {
        this.send('pong');
        const validCbs = wsCallbacks.filter(item => item.type === 'pong');
        validCbs.forEach(({ cb }) => cb());
      } catch (e) {
        handleErrorMiddleware(e, 'socket');
      }
    } else {
      clearInterval(this.idleTimeout);
      this.dispatchEvent(new Event('close'));
    }
  };

  socket.startPingPong = function() {
    clearInterval(this.idleTimeout);
    this.idleTimeout = setInterval(this.pong, 5000); // disconnects after 30 sec of idle
  };

  socket.sendEvent = function(type, data = {}) {
    if (this.readyState === this.OPEN) {
      try {
        this.send(JSON.stringify({ ...data, type }));
      } catch (e) {
        handleErrorMiddleware(e, 'socket');
      }
      this.startPingPong();
    } else {
      this.dispatchEvent(new Event('close'));
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
      console.log(data);

      const validCbs = wsCallbacks.filter(item => item.type === _type);
      validCbs.forEach(({ cb }) => cb(data));
      this.startPingPong();
    }
  };

  socket.closeSocket = socket.closeSocket.bind(socket);
  socket.pong = socket.pong.bind(socket);
  socket.startPingPong = socket.startPingPong.bind(socket);
  socket.sendEvent = socket.sendEvent.bind(socket);
  socket.addEventListener('message', onMessage.bind(socket));
};

const defaultEvents = ['error', 'open', 'message', 'close'];

export const socketMixin = {
  mounted() {
    if (this.$options.sockets) {
      Object.keys(this.$options.sockets).forEach(event => {
        const cb = this.$options.sockets[event];

        if (defaultEvents.includes(event)) {
          this.socket.addEventListener(event, cb.bind(this));
        } else {
          addWsCallbacks(event, cb.bind(this));
        }
      });
    }
  },
};
