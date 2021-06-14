import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// 引入头部导航栏全局组件
import HeaderNav from "./components/HeaderNav.vue";
Vue.component("header-nav", HeaderNav);

// 引入elementUI组件库
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.config.productionTip = false;
Vue.use(ElementUI);
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");
