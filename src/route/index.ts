import { createRouter, createWebHistory} from "vue-router";
const home = () => import('../home.vue')
const dashboard = () => import('../dashboard.vue')

const routes = [
    {
        path:"/",
        component: home
    },
    {
        path:"/home",
        component: home
    },
    {
        path:"/dashboard",
        component:dashboard
    }
]


const router = createRouter({
    history:createWebHistory(),
    routes:routes,
})

export default router