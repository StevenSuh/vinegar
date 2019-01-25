<template>
  <div class="result-wrapper">
    <div class="result-item" v-for="item in data" :key="item.sessionId">
      <div class="result-name">
        <h6 class="result-school" v-html="highlightSchool(item)" />
        <span class="name-filler" />
        <p class="result-session" v-html="highlightSession(item)" />
      </div>
      <p>{{ 'Created at ' + formatDate(item.createdAt) }}</p>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    formatDate(date) {
      date = new Date(date);

      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? `0${minutes}` : minutes;

      return `${hours}:${minutes} ${ampm}`;
    },
    highlightSchool(data) {
      const fullName = `${data.schoolName} ${data.sessionName}`.toLowerCase();

      const indexes = [];
      let i = 0;
      while (i < data.schoolName.length) {
        const index = fullName.indexOf(this.query, i);

        if (index === -1) {
          break;
        }

        i = index + this.query.length;
        indexes.push(index);
      }

      i = 0;
      const filteredName = indexes.reduce((accumulated, index) => {
        const result = accumulated + data.schoolName.slice(i, index) + '<span class="highlightSearch">' +
          data.schoolName.slice(index, index + this.query.length) + '</span>';

        i = index + this.query.length;
        return result;
      }, '');

      return filteredName + data.schoolName.slice(i);
    },
    highlightSession(data) {
      const fullName = `${data.schoolName} ${data.sessionName}`.toLowerCase();

      const indexes = [];
      let i = 0;
      while (i < fullName.length) {
        const index = fullName.indexOf(this.query, i);

        if (index === -1) {
          break;
        }

        i = index + this.query.length;

        if (i > data.schoolName.length) {
          indexes.push(index);
        }
      }


      i = 0;
      const filteredName = indexes.reduce((accumulated, index) => {
        index -= (data.schoolName.length + 1);
        const queryLen = this.query.length + Math.min(index, 0);
        index = Math.max(index, 0);

        const result = accumulated + data.sessionName.slice(i, index) + '<span class="highlightSearch">' +
          data.sessionName.slice(index, index + queryLen) + '</span>';

        i = index + queryLen;
        return result;
      }, '');

      return filteredName + data.sessionName.slice(i);
    },
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    query: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>
.result-wrapper {
  background-color: var(--white-bg-color);
  border: 1px solid var(--gray-bg-color-2);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  max-height: 340px;
  overflow-y: scroll;
  padding: 10px 0;
  top: -1px;
  width: 100%;
}

.result-item {
  cursor: pointer;
  padding: 15px 20px;
}

.result-item:hover {
  background-color: var(--gray-bg-color-hover);
}

.result-name {
  margin-bottom: 10px;
}

.name-filler {
  padding-left: 9px;
}

.result-school,
.result-session {
  display: inline-block;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.result-session {
  color: var(--dark-gray-font-color);
}
</style>

<style>
.highlightSearch {
  color: var(--main-font-color);
  font-weight: 500;
}
</style>
