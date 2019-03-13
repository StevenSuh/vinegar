<template>
  <div class="join-wrapper">
    <h2 class="join-header paddingTop large">
      Join a Session
    </h2>
    <p class="join-message paddingTop small">
      Search for the session you'd like to join.
    </p>
    <div class="paddingTop paddingBottom" />
    <div class="search-wrapper">
      <h6 class="search-title">
        Session Name
      </h6>
      <InputComponent
        :id="searchInputId"
        autocomplete="off"
        autosearch="on"
        label="Search"
        name="search"
        placeholder="Type your session name..."
        suggestion="Try &quot;UCSC&quot;"
        type="search"
        :class="{ 'search-expanded': searchQuery.length > 1 && searched }"
        :on-autosearch="onSearch"
        :on-clear-search="onClearSearch"
        :value="searchQuery"
        @onChange="onInputChange"
      />
      <transition name="fadeNoDelay">
        <SearchResult
          v-if="searchQuery.length > 1 && searched"
          class="searchResult"
          :data="searchResult"
          :has-more="hasMore"
          :input-id="searchInputId"
          :query="searchQuery"
          :on-search="onSearch"
        />
      </transition>
    </div>
  </div>
</template>

<script>
import InputComponent from '@/components/input';
import SearchResult from '@/views/findPage/searchResult';
import { getSearchSessionResults } from '@/services/api';

export default {
  components: {
    InputComponent,
    SearchResult,
  },
  data() {
    return {
      // state
      hasMore: false,
      searched: false,
      searchInputId: 'join-input',
      searchQuery: '',
      searchOffset: 0,
      searchResult: [],
    };
  },
  mounted() {
    this.track();
  },
  methods: {
    onClearSearch() {
      this.searchResult = [];
      this.searched = false;
    },
    onInputChange(value) {
      this.searchQuery = value;
    },
    async onSearch(_, withOffset) {
      const { result, hasMore } = await getSearchSessionResults(
        this.searchQuery,
        withOffset ? this.searchResult.length : 0,
      );
      this.hasMore = hasMore;
      this.searchResult = withOffset
        ? this.searchResult.concat(result)
        : result;
      this.searched = true;
    },
    track() {
      this.$ga.page('/app/join');
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
  width: 75%;
}

.search-title {
  letter-spacing: 0.3px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.searchResult {
  top: -25px;
}

@media (max-width: 800px) {
  .join-header {
    font-size: 30px;
  }

  .join-message {
    font-size: 16px;
  }

  .search-wrapper {
    width: 90%;
  }
}
</style>

<style>
.search-expanded input {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
</style>
