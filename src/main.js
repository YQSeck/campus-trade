// 【公共基础】Vue 应用入口
// AI 生成：手动调整前请勿修改
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import pinia from "./store";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./styles/variables.css";

const app = createApp(App);
app.use(router);
app.use(pinia);
app.use(ElementPlus);
app.mount("#app");
