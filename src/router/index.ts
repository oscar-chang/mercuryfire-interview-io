import { createRouter, createWebHistory } from 'vue-router';
import IndexPage from '@/pages/IndexPage.vue';

const routes = [
    {
        path: '/', // 根路徑
        name: 'Home',
        component: IndexPage,
    },
];

const router = createRouter({
    history: createWebHistory(), // 使用 HTML5 路由模式
    routes,
});

export default router;
