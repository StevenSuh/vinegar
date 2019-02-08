import axios from 'axios';
import { handleErrorMiddleware } from '@/services/middleware';

const apiTemplate = fn => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    handleErrorMiddleware(err);
    throw new Error(err.response.data);
  }
};

export const signOut = apiTemplate(
  async () => {
    const res = await axios.get(
      '/api/signout',
    );
    return res.data;
  },
);

export const getSigninUrl = apiTemplate(
  async () => {
    const res = await axios.get(
      '/api/signin',
    );
    return res.data;
  },
);

export const getAuthStatus = apiTemplate(
  async () => {
    const res = await axios.get(
      '/api/auth/status',
    );
    return res.data;
  },
);

export const getSessionPasswordStatus = apiTemplate(
  async () => {
    const res = await axios.get(
      '/api/session/password',
    );
    return res.data;
  },
);

export const getUserSessionInfo = apiTemplate(
  async () => {
    const res = await axios.get(
      '/api/user/session',
    );
    return res.data;
  },
);

export const getSessionInfo = apiTemplate(
  async () => {
    const res = await axios.get(
      '/api/session',
    );
    return res.data;
  },
);

export const getSearchSessionResults = apiTemplate(
  async (query) => {
    const res = await axios.get(
      `/api/session/search?query=${query}`,
    );
    return res.data;
  },
);

export const createSession = apiTemplate(
  async (data) => {
    const res = await axios.post(
      '/api/session/create',
      data,
    );
    return res.data;
  },
);

export const validateSessionPassword = apiTemplate(
  async (password) => {
    const res = await axios.post(
      '/api/session/password',
      { password },
    );
    return res.data;
  },
);

export const enterSession = apiTemplate(
  async (data) => {
    const res = await axios.post(
      '/api/session/enter',
      data,
    );
    return res.data;
  },
);
