// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
import { createRouter, createWebHistory } from 'vue-router';

// 璺敱鏍规暟缁勶細鍚勬ā鍧楄矾鐢遍€氳繃 modules/*.js 鑷姩娉ㄥ叆
const routes = [];

// 鑷姩鍔犺浇 src/router/modules/ 涓嬫墍鏈夎矾鐢辨ā鍧楋紝鏂板妯″潡鏃犻渶鎵嬪姩娉ㄥ唽
const moduleFiles = import.meta.glob('./modules/*.js', { eager: true });
Object.values(moduleFiles).forEach((module) => {
  if (module.default) {
    routes.push(...module.default);
  }
});

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
