import { createApp } from "vue";
import App from "./App.vue";

import "~/styles/index.scss";

import "element-plus/theme-chalk/src/message.scss"//element-plus

import router from './route'
const app = createApp(App);
app.use(router)
// app.use(ElementPlus);
app.mount("#app");
