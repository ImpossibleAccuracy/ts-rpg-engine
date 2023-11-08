import "@/assets/css/main.css";

import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import App from "@/App.vue";
import Home from "@/components/HomePage.vue";
import PathNotFound from "@/components/PathNotFound.vue";

const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/:pathMatch(.*)*", component: PathNotFound },
  ],
});

createApp(App).use(router).mount("#app");
