import axios from 'axios';
import { handleErrorMiddleware } from '@/services/middleware';

const apiTemplate = fn => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    handleErrorMiddleware(err);
    return {};
  }
};

export const postSession = apiTemplate(
  async (data) => {
    const res = await axios.post(
      '/api/create/session',
      data,
      { withCredentials: true },
    );
    return res.data;
  },
);

export const getAuthStatus = apiTemplate(
  async () => {
    const res = await axios.get(
      '/api/auth/status',
      { withCredentials: true },
    );
    return res.data;
  },
);

export const getSigninUrl = apiTemplate(
  async () => {
    const res = await axios.get(
      '/api/signin',
      { withCredentials: true },
    );
    return res.data;
  },
);

export const getSearchSessionResults = apiTemplate(
  async (query) => {
    const res = await axios.get(
      `/api/search/session?query=${query}`,
      { withCredentials: true },
    );
    return res.data;
  },
);
