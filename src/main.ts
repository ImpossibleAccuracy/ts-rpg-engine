import "@/assets/css/main.css";

import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import App from "@/App.vue";
import EggPage from "@/components/EggPage.vue";
import PathNotFound from "@/components/PathNotFound.vue";
import CarPage from "@/components/CarPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: EggPage },
    { path: "/car", component: CarPage },
    { path: "/:pathMatch(.*)*", component: PathNotFound },
  ],
});

createApp(App).use(router).mount("#app");
