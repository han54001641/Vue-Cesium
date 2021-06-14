<template>
  <div>
    <el-menu
      :default-active="activeIndex2"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      router
    >
      <el-menu-item index="1" route="/">首页</el-menu-item>
      <!-- 底图加载 -->
      <el-submenu index="2">
        <template slot="title">底图加载</template>
        <el-menu-item
          v-for="(item, index) in menu[0]"
          :key="index"
          :index="`2-${index + 1}`"
          :route="item.url"
          >{{ item.name }}</el-menu-item
        >
      </el-submenu>
      <!-- 测量 -->
      <el-submenu index="3">
        <template slot="title">基于天地图测量</template>
        <el-menu-item
          v-for="(item, index) in menu[1]"
          :key="index"
          :index="`3-${index + 1}`"
          :route="item.url"
          >{{ item.name }}</el-menu-item
        >
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "1",
      activeIndex2: "1",
      menu: [
        [
          {
            url: "/tdt",
            name: "天地图影像底图(叠加地形+中文注记+天地图影像)",
          },
          { url: "/bd", name: "百度底图" },
          { url: "/arcgis", name: "arcgis底图" },
          { url: "/gaode", name: "高德底图" },
          { url: "/basechange", name: "底图选择切换" },
        ],
        [{ url: "/measereline", name: "空间测距+空间高度差" }],
      ],
    };
  },
  mounted() {
    if (sessionStorage.getItem("activeIndex2")) {
      this.activeIndex2 = sessionStorage.getItem("activeIndex2");
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
      sessionStorage.setItem("activeIndex2", key);
      this.activeIndex2 = key;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>