import axios from 'axios';
import { handleErrorMiddleware } from '@/services/middleware';

const apiTemplate = fn => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    handleErrorMiddleware(err);
    throw new Error(`Error has occurred making an API call`);
  }
};

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

export const postSession = apiTemplate(
  async (data) => {
    const res = await axios.post(
      '/api/session/create',
      data,
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

export const getSearchSessionResults = apiTemplate(
  async (query) => {
    const res = await axios.get(
      `/api/session/search?query=${query}`,
    );
    return res.data;
  },
);
