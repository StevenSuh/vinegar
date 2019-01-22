<template>
  <div class="join-wrapper">
    <h2 class="join-header paddingTop large">Join a Session</h2>
    <p class="join-message paddingTop small">
      Search for the session you'd like to join.
    </p>
    <div class="paddingTop paddingBottom" />
    <div class="search-wrapper">
      <h6 class="search-title">Session Name</h6>
      <InputComponent
        autocomplete="off"
        autosearch="on"
        :class="{'search-expanded': searchResult.length > 0}"
        id="join-input"
        label="Search"
        name="search"
        :onAutosearch="onSearch"
        :onClearSearch="onClearSearch"
        :onValidate="onValidate"
        placeholder="Type your session name..."
        type="search"
        :value="searchInput"
        v-on:onChange="onInputChange"
      />
      <transition name="fadeNoDelay">
        <SearchResult :data="searchResult" v-if="searchResult.length > 0" />
      </transition>
    </div>
  </div>
</template>

<script>
import InputComponent from '@/components/input';
import SearchResult from '@/views/findPage/searchResult';
import {getSearchSessionResults} from '@/services/api';
import {ALLOWED_CHARACTERS} from '@/defs';

const regex = new RegExp('^$|^[' + ALLOWED_CHARACTERS.join('') + ']+$');

export default {
  components: {
    InputComponent,
    SearchResult,
  },
  data() {
    return {
      // state
      searchInput: '',
      searchOffset: 0,
      searchResult: [],
    };
  },
  methods: {
    onClearSearch: function() {
      this.searchResult = [];
    },
    onInputChange: function(value) {
      this.searchInput = value;
    },
    onSearch: async function() {
      this.searchResult = await getSearchSessionResults();
    },
    onValidate: function(value) {
      return Boolean(regex.exec(value));
    },
  },
};
</script>

<style scoped>
.join-wrapper {
  width: 100%;
}

.join-header {
  font-size: 38px;
  font-weight: 500;
  text-align: center;
}

.join-message {
  font-size: 18px;
  text-align: center;
}

.search-wrapper {
  margin: auto;
  width: 750px;
}

.search-title {
  letter-spacing: 0.3px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  text-transform: uppercase;
}
</style>

<style>
.search-expanded input {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
</style>
