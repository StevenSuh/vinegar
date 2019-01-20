import axios from 'axios';

export const getSigninUrl = () => {
  return axios.get('http://localhost:3000/api/signin')
    .then(res => {
      return res.data;
    });
};
