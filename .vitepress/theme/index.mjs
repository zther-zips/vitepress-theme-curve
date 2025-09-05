import { h } from "vue";
import { createPinia } from "pinia";
import { routeChange } from "@/utils/initTools.mjs";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";
import LazyLoader from "@/components/LazyLoader.vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// 根组件
import App from "@/App.vue";
// 全局样式
import "@/style/main.scss";

// pinia
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// InstantSearch
import InstantSearch from "vue-instantsearch/vue3/es";

// 🐾 BakaChat
import BakaChat from "@/components/BakaChat.vue";
// 🐾 Bakagptapi
import { createBakagpt } from "bakagptapi";

const Theme = {
  Layout: () => h(App),
  enhanceApp({ app, router, siteData }) {
    // 挂载
    app.use(pinia);
    app.use(InstantSearch);
    app.component("LazyLoader", LazyLoader);

    // 🐾 注册baka小窗组件
    app.component("BakaChat", BakaChat);

    // 🐾 注册bakagptapi插件
    app.use(createBakagpt({
      apiKey: "你的apikey喵",
      endpoint: "https://api.bakagpt.top"
    }));

    // 插件
    enhanceAppWithTabs(app);

    // 路由守卫
    router.onBeforeRouteChange = (to) => {
      routeChange("before", to);
    };
    router.onAfterRouteChanged = (to) => {
      routeChange("after", to);
    };
  },
};

export default Theme;
