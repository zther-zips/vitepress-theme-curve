import { defineConfig } from "vitepress";
import { createRssFile } from "./theme/utils/generateRSS.mjs";
import {
  getAllPosts,
  getAllType,
  getAllCategories,
  getAllArchives,
} from "./theme/utils/getPostData.mjs";
import { jumpRedirect } from "./theme/utils/commonTools.mjs";
import { getThemeConfig } from "./init.mjs";
import markdownConfig from "./theme/utils/markdownConfig.mjs";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import path from "path";

// 获取全局数据
const postData = await getAllPosts();

// 获取主题配置
const themeConfig = await getThemeConfig();

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: themeConfig.siteMeta.title,
  description: themeConfig.siteMeta.description,
  lang: themeConfig.siteMeta.lang,

  // 简洁的 URL
  cleanUrls: true,
  base: "/",

  // 最后更新时间戳
  lastUpdated: true,

  // 主题
  appearance: "dark",

  // Head
  head: themeConfig.inject.header,

  // sitemap
  sitemap: {
    hostname: themeConfig.siteMeta.site,
  },

  // 主题配置
  themeConfig: {
    ...themeConfig,
    // 必要数据
    postData: postData,
    tagsData: getAllType(postData),
    categoriesData: getAllCategories(postData),
    archivesData: getAllArchives(postData),
  },

  // markdown
  markdown: {
    math: true,
    lineNumbers: true,
    toc: { level: [1, 2, 3] },
    image: {
      lazyLoading: true,
    },
    config: (md) => markdownConfig(md, themeConfig),
  },

  // 构建排除
  srcExclude: ["**/README.md", "**/TODO.md"],

  // transformHead
  transformPageData: async (pageData) => {
    // canonical URL
    const canonicalUrl = `${themeConfig.siteMeta.site}/${pageData.relativePath}`
      .replace(/index\.md$/, "")
      .replace(/\.md$/, "");
    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(["link", { rel: "canonical", href: canonicalUrl }]);
  },

  // transformHtml
  transformHtml: (html) => {
    return jumpRedirect(html, themeConfig);
  },

  // buildEnd
  buildEnd: async (config) => {
    await createRssFile(config, themeConfig);
  },

  // vite
  vite: {
    plugins: [
      AutoImport({
        imports: ["vue", "vitepress"],
        dts: ".vitepress/auto-imports.d.ts",
      }),
      Components({
        dirs: [".vitepress/theme/components", ".vitepress/theme/views"],
        extensions: ["vue", "md"],
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        dts: ".vitepress/components.d.ts",
      }),
    ],
    resolve: {
      // 配置路径别名
      alias: {
        "@": path.resolve(__dirname, "./theme"),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
    // 服务器
    server: {
      port: 9877,
    },
    // 构建
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          pure_funcs: ["console.log"],
        },
      },
    },
  },
});
