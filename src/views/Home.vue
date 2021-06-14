<template>
  <div id="container">
    <div class="homebj">
      <div class="text">My Cesium实例持续更新中...</div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.homebj {
  width: 100%;
  height: 100%;
  background: url("../assets/imgs/welcomebg.jpg") no-repeat center;
  background-size: cover;
  position: relative;
  .text {
    color: white;
    font-size: 2.5rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>