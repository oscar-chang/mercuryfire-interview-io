import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router); // 如果使用 Vue Router，記得註冊
app.mount('#app'); // 確保掛載到 index.html 的 #app
