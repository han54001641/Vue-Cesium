import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  // 天地图底图路由
  {
    path: "/tdt",
    name: "Tianditu",
    component: () =>
      import(
        /* webpackChunkName: "tdt" */ "../components/ImageryProvider/Tianditu.vue"
      ),
  },
  // 百度底图路由
  {
    path: "/bd",
    name: "Baidu",
    component: () =>
      import(
        /* webpackChunkName: "bd" */ "../components/ImageryProvider/Baidu.vue"
      ),
  },
  //谷歌底图路由
  {
    path: "/arcgis",
    name: "Arcgis",
    component: () =>
      import(
        /* webpackChunkName: "arcgis" */ "../components/ImageryProvider/Arcgis.vue"
      ),
  },
  //高德底图路由
  {
    path: "/gaode",
    name: "Gaode",
    component: () =>
      import(
        /* webpackChunkName: "gaode" */ "../components/ImageryProvider/Gaode.vue"
      ),
  },
  //底图切换路由
  {
    path: "/basechange",
    name: "BaseChange",
    component: () =>
      import(
        /* webpackChunkName: "basechange" */ "../components/ImageryProvider/BaseChange.vue"
      ),
  },
  // 空间测距+高度差
  {
    path: "/measereline",
    name: "MeasureLineAndHeight",
    component: () =>
      import(
        /* webpackChunkName: "measereline" */ "../components/measure/MeasureLineAndHeight.vue"
      ),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
