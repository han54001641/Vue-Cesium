<template>
  <div id="app">
    <el-container direction="vertical">
      <el-header>
        <header-nav></header-nav>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>
<style lang="scss">
html,
body,
#app,
#container {
  width: 100%;
  min-width: 960px;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.el-container {
  width: 100%;
  height: 100%;
  .el-main {
    height: 100%;
    padding: 0;
  }
  .el-header {
    padding: 0;
  }
}
</style>
