/* eslint-disable import/prefer-default-export */
export const formatDuration = (value) => {
  // value is in milliseconds
  let hour = Math.floor(value / (60 * 60 * 1000));
  hour = hour < 10 ? `0${hour}` : hour;

  let minute = Math.floor(value / (60 * 1000)) % 60;
  minute = minute < 10 ? `0${minute}` : minute;

  let second = Math.floor(value / 1000) % 60;
  second = second < 10 ? `0${second}` : second;

  return `${hour}:${minute}:${second}`;
};
