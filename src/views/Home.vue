<template>
  <div id="cesium_container"></div>
</template>

<script>
export default {
  mounted() {
    this.initViewer();
  },
  methods: {
    initViewer() {
      var viewer = new Cesium.Viewer("cesium_container", {});
    },
  },
};
</script>

<style lang="scss" scoped>
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
#cesium_container {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>