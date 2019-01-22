import axios from 'axios';
import { handleErrorMiddleware } from '@/services/middleware';

const BASE_URL = 'http://localhost:3000';

const apiTemplate = fn => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    handleErrorMiddleware(err);
    return {};
  }
};

export const getAuthStatus = apiTemplate(
  async () => {
    const res = await axios.get(
      `${BASE_URL}/api/auth/status`,
      { withCredentials: true },
    );
    return res.data;
  }
);

export const getSigninUrl = apiTemplate(
  async () => {
    const res = await axios.get(
      `${BASE_URL}/api/signin`,
      { withCredentials: true },
    );
    return res.data;
  }
);

export const getSearchSessionResults = apiTemplate(
  async (query) => {
    const res = await axios.get(
      `${BASE_URL}/api/search/session?query=${query}`,
      { withCredentials: true },
    );
    return res.data;
  }
);
