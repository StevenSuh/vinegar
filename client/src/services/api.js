import axios from 'axios';
import { handleErrorMiddleware } from '@/services/middleware';

const apiTemplate = (endpoint, fn) => async (...args) => {
  try {
    return await fn(endpoint, ...args);
  } catch (err) {
    handleErrorMiddleware(err.response.data, endpoint);
    throw new Error(err.response.data);
  }
};

export const signOut = apiTemplate(
  '/api/signout',
  async (endpoint) => {
    const res = await axios.get(endpoint);
    return res.data;
  },
);

export const signIn = apiTemplate(
  '/api/signin',
  async (endpoint) => {
    const res = await axios.get(endpoint);
    return res.data;
  },
);

export const getAuthStatus = apiTemplate(
  '/api/auth/status',
  async (endpoint) => {
    const res = await axios.get(endpoint);
    return res.data;
  },
);

export const getSessionPasswordStatus = apiTemplate(
  '/api/session/password',
  async (endpoint) => {
    const res = await axios.get(endpoint);
    return res.data;
  },
);

export const getUserSessionInfo = apiTemplate(
  '/api/user/session',
  async (endpoint) => {
    const res = await axios.get(endpoint);
    return res.data;
  },
);

export const getSessionInfo = apiTemplate(
  '/api/session',
  async (endpoint) => {
    const res = await axios.get(endpoint);
    return res.data;
  },
);

export const getSearchSessionResults = apiTemplate(
  '/api/session/search',
  async (endpoint, query) => {
    const res = await axios.get(`${endpoint}?query=${query}`);
    return res.data;
  },
);

export const createSession = apiTemplate(
  '/api/session/create',
  async (endpoint, data) => {
    const res = await axios.post(endpoint, data);
    return res.data;
  },
);

export const validateSessionPassword = apiTemplate(
  '/api/session/password',
  async (endpoint, password) => {
    const res = await axios.post(endpoint, { password });
    return res.data;
  },
);

export const enterSession = apiTemplate(
  '/api/session/enter',
  async (endpoint, data) => {
    const res = await axios.post(endpoint, data);
    return res.data;
  },
);
