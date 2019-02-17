/* eslint no-param-reassign: 0 */
/* eslint no-underscore-dangle: 0 */
const uuidv4 = require('uuid/v4');

const { addWsCallback, wsRedisPub } = require('./redis');

const { REDIS_EVENT } = require('./defs');

const WsWrapper = (ws) => {
  const wsEvents = [];
  ws.id = uuidv4();

  ws.sessions = [];
  ws.join = (sessionId) => {
    ws.sessions.push(sessionId);
  };

  ws.onEvent = (type, cb) => {
    wsEvents.push({ type, cb });
  };

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const { type } = data;

    const validEvents = wsEvents.filter(item => item.type === type);
    validEvents.forEach(({ cb }) => {
      cb(data);
    });
  });

  ws.onEventServer = (type, cb) => {
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
    const json = JSON.stringify({ ...data, _type: type });
    ws.send(json);
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
  wss.onEventServer = (type, cb) => {
    addWsCallback(type, (data) => {
      const { _except, _target } = data;

      wss.clients.forEach((client) => {
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
    });
  });

  return wss;
};

module.exports = {
  WsWrapper,
  WssWrapper,
};
