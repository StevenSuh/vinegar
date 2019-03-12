/* eslint no-param-reassign: 0 */
/* eslint no-underscore-dangle: 0 */
const uuidv4 = require('uuid/v4');
const WebSocket = require('ws');

const { checkAsync, tryCatch } = require('utils');

const { addWsCallback, wsRedisPub } = require('./redis');

const { REDIS_EVENT } = require('./defs');
const { socketLogger } = require('./utils');

const WsWrapper = (ws) => {
  const wsEvents = [];
  ws.id = uuidv4();

  ws.sessions = [ws.id];
  ws.join = (sessionId) => {
    ws.sessions.push(sessionId);
  };

  ws.onEvent = (type, cb) => {
    if (['message', 'close', 'error', 'open'].includes(type)) {
      throw new Error(`${type} event is a part of default events. Use 'on' api instead of 'onEvent'.`);
    }

    wsEvents.push({ type, cb });
  };

  ws.on('message', (message) => {
    if (message === 'pong') {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      } else {
        ws.terminate();
      }
      return;
    }

    const data = tryCatch(() => JSON.parse(message));
    if (data) {
      const { type } = data;

      const validEvents = wsEvents.filter(item => item.type === type);
      validEvents.forEach(({ cb }) => {
        const start = Date.now();

        if (checkAsync(cb)) {
          cb(data).then(() =>
            socketLogger(message, ws, Date.now() - start));
        } else {
          cb(data);
          socketLogger(message, ws, Date.now() - start);
        }
      });
    }
  });

  ws.onServer = (type, cb) => {
    addWsCallback(type, (data) => {
      const { _except, _target } = data;

      if (_except && ws.id === _except) {
        return null;
      }

      if (_target && ws.sessions.includes(_target)) {
        return cb(data);
      }
    });
  };

  ws.sendEvent = (type, data = {}) => {
    if (ws.readyState === WebSocket.OPEN) {
      const json = JSON.stringify({ ...data, _type: type });
      ws.send(json);
    } else {
      ws.terminate();
    }
  };

  ws.toAll = (type, data = {}) => {
    wsRedisPub.publishEvent(REDIS_EVENT, {
      ...data,
      _except: ws.id,
      _type: type,
    });
  };

  ws.toAllServer = (type, data = {}) => {
    wsRedisPub.publishEvent(type, {
      ...data,
      _except: ws.id,
    });
  };

  ws.to = (target = '*') => {
    if (target === '*') {
      return ws.toAll;
    }
    return {
      sendEvent: (type, data = {}) => {
        wsRedisPub.publishEvent(REDIS_EVENT, {
          ...data,
          _except: ws.id,
          _target: target,
          _type: type,
        });
      },
      sendServer: (type, data = {}) => {
        wsRedisPub.publishEvent(type, {
          ...data,
          _except: ws.id,
          _target: target,
        });
      },
    };
  };

  return ws;
};

const WssWrapper = (wss) => {
  wss.onServer = (type, cb) => {
    addWsCallback(type, (data) => {
      const { _except, _target } = data;

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          if (_except && client.id === _except) {
            return null;
          }

          if (_target) {
            if (client.sessions.includes(_target)) {
              return cb(data);
            }
          } else {
            return cb(data);
          }
        }
      });
    });
  };

  wss.toAll = (type, data = {}) => {
    wsRedisPub.publishEvent(REDIS_EVENT, {
      ...data,
      _type: type,
    });
  };

  wss.toAllServer = (type, data = {}) => {
    wsRedisPub.publishEvent(type, { ...data });
  };

  wss.to = (target = '*') => {
    if (target === '*') {
      return wss.toAll;
    }
    return {
      sendEvent: (type, data = {}) => {
        wsRedisPub.publishEvent(REDIS_EVENT, {
          ...data,
          _target: target,
          _type: type,
        });
      },
      sendServer: (type, data = {}) => {
        wsRedisPub.publishEvent(type, {
          ...data,
          _target: target,
        });
      },
    };
  };

  addWsCallback(REDIS_EVENT, (data) => {
    const { _except, _target, _type } = data;

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        if (_except && client.id === _except) {
          return null;
        }

        if (_target) {
          if (client.sessions.includes(_target)) {
            return client.sendEvent(_type, data);
          }
        } else {
          return client.sendEvent(_type, data);
        }
      }
    });
  });

  return wss;
};

module.exports = {
  WsWrapper,
  WssWrapper,
};
