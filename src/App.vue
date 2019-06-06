<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
}
</script>

<style>
body {
  margin: 0;
  background: #f6f6f6;
}

#app {
  max-width: 1024px;
  margin: 0 auto;
  background: #fff;
  overflow: auto;
  font-family: 'Ubuntu';
}
</style>
