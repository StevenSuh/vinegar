<template>
  <div id="app">
    <router-view />
    <Snackbar />
  </div>
</template>

<script>
import Snackbar from '@/components/snackbar';
import './style.css';

export default {
  name: 'App',
  components: {
    Snackbar,
  },
};
</script>
