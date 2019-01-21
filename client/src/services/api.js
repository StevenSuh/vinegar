import axios from 'axios';

export const getSigninUrl = async () => {
  const res = await axios.get(
    'http://localhost:3000/api/signin',
    { withCredentials: true },
  );

  return res.data.signinUrl;
};
