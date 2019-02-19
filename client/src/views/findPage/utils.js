export function formatDate(date) {
  const wrapDate = new Date(date);

  let hours = wrapDate.getHours();
  let minutes = wrapDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours %= 12;
  hours = hours || 12;
  minutes = minutes < 10 ? `0${minutes}` : minutes;

  const today = new Date();
  const yearDiff = today.getFullYear() - wrapDate.getFullYear();
  const monthDiff = today.getMonth() - wrapDate.getMonth();
  const dayDiff = today.getDate() - wrapDate.getDate();

  const diff = yearDiff || monthDiff || dayDiff;
  const diffType = yearDiff && 'year' || monthDiff && 'month' || dayDiff && 'day';

  let dateStr = '';
  if (diff) {
    const isPlural = diff > 1;
    dateStr = ` - ${isPlural ? diff : 'a'} ${diffType + (isPlural ? 's' : '')} ago`;
  }

  return `${hours}:${minutes} ${ampm}${dateStr}`;
};

export function highlightSchool(data) {
  const query = this.query.toLowerCase();
  const fullName = `${data.schoolName} ${data.sessionName}`.toLowerCase();

  const indexes = [];
  let i = 0;
  while (i < data.schoolName.length) {
    const index = fullName.indexOf(query, i);

    if (index === -1) {
      break;
    }

    i = index + query.length;
    indexes.push(index);
  }

  i = 0;
  const filteredName = indexes.reduce((accumulated, index) => {
    const result = `${accumulated + data.schoolName.slice(i, index)}<span class="highlightSearch">${
      data.schoolName.slice(index, index + query.length)}</span>`;

    i = index + query.length;
    return result;
  }, '');

  return filteredName + data.schoolName.slice(i);
};

export function highlightSession(data) {
  const query = this.query.toLowerCase();
  const fullName = `${data.schoolName} ${data.sessionName}`.toLowerCase();

  const indexes = [];
  let i = 0;
  while (i < fullName.length) {
    const index = fullName.indexOf(query, i);

    if (index === -1) {
      break;
    }

    i = index + query.length;

    if (i > data.schoolName.length) {
      indexes.push(index);
    }
  }

  i = 0;
  const filteredName = indexes.reduce((accumulated, idx) => {
    let index = idx - (data.schoolName.length + 1);
    const queryLen = query.length + Math.min(index, 0);
    index = Math.max(index, 0);

    const result = `${accumulated + data.sessionName.slice(i, index)}<span class="highlightSearch">${
      data.sessionName.slice(index, index + queryLen)}</span>`;

    i = index + queryLen;
    return result;
  }, '');

  return filteredName + data.sessionName.slice(i);
};
