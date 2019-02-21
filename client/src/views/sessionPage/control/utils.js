/* eslint-disable import/prefer-default-export */
export const formatDuration = (value) => {
  let hour = Math.floor(value / 60);
  hour = hour < 10 ? `0${hour}` : hour;
  let minute = value % 60;
  minute = minute < 10 ? `0${minute}` : minute;
  return `${hour}:${minute}:00`;
};
