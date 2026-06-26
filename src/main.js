// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
import './styles/global.css';

const app = createApp(App);

// 鎻掍欢娉ㄥ唽椤哄簭锛歅inia锛堢姸鎬佺鐞嗭級鈫?Router锛堣矾鐢憋級鈫?Element Plus锛圲I 缁勪欢锛?app.use(createPinia());
app.use(router);
app.use(ElementPlus);

app.mount('#app');
