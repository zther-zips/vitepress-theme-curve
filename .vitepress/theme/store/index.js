import { defineStore } from "pinia";
import cursorInit from '@/utils/cursor.js';

let appCursorInstance;

export const mainStore = defineStore("main", {
  state: () => {
    return {
      // 主题类别
      themeType: "auto",
      themeValue: "light", // 实际生效的主题颜色：'light' 或 'dark'
      // banner
      bannerType: "half",
      // 加载状态
      loadingStatus: true,
      // 滚动高度
      scrollData: {
        // 滚动高度
        height: 0,
        // 滚动百分比
        percentage: 0,
        // 滚动方向
        direction: "down",
      },
      // 页脚可见性
      footerIsShow: false,
      // 中控台显示
      controlShow: false,
      // 搜索框显示
      searchShow: false,
      // 个性化配置显示
      showSeetings: false,
      // 播放器数据
      playState: false,
      playerShow: true,
      playerVolume: 0.7,
      playerData: {
        name: "未知曲目",
        artist: "未知艺术家",
      },
      // 移动端菜单显示
      mobileMenuShow: false,
      // 使用自定义右键菜单
      useRightMenu: true,
      // 背景模糊
      backgroundBlur: false,
      // 全站字体
      fontFamily: "hmos",
      // 全站字体大小
      fontSize: 16,
      // 信息显示位置
      infoPosition: "fixed",
      // 上次滚动位置
      lastScrollY: 0,
      // 站点背景
      backgroundType: "patterns",
      backgroundUrl: "https://tuapi.eees.cc/api.php?category={dongman,fengjing}&type=302",
    };
  },
  getters: {},
  actions: {
    // 切换应用状态
    changeShowStatus(value, blur = true) {
      this[value] = !this[value];
      // 阻止滚动
      document.body.style.overflowY = this[value] ? "hidden" : "";
      // 全局模糊
      const globalApp = document.getElementById("app");
      this[value] && this.backgroundBlur && blur
        ? globalApp.classList.add("blur")
        : globalApp.classList.remove("blur");
    },
    // 更改字体大小
    changeFontSize(isAdd = false) {
      if (isAdd) {
        if (this.fontSize < 20) {
          this.fontSize++;
        }
      } else {
        if (this.fontSize > 14) {
          this.fontSize--;
        }
      }
      const htmlElement = document.documentElement;
      htmlElement.style.fontSize = this.fontSize + "px";
    },
    // 切换明暗模式
    changeThemeType() {
      // 禁止壁纸模式切换
      if (this.backgroundType === "image") {
        if (typeof $message !== "undefined") { 
          $message.warning("无法在壁纸模式下切换明暗模式", {
            duration: 1500,
          });
        }
        return false;
      }
      this.themeType === "auto"
        ? (this.themeType = "dark")
        : this.themeType === "dark"
          ? (this.themeType = "light")
          : (this.themeType = "auto");

      // 计算实际生效的 themeValue 并设置 CSS 变量
      this.updateActualThemeValue();

      // 弹窗提示
      if (typeof $message !== "undefined") { 
        const text =
          this.themeType === "light"
            ? "浅色模式"
            : this.themeType === "dark"
              ? "深色模式"
              : "跟随系统";
        $message.info("当前主题为" + text, {
          duration: 1500,
        });
      }

      // 通知光标更新主题
      if (appCursorInstance) {
        appCursorInstance.setThemeType(this.themeType);
      }
    },

    // 新增方法：更新实际生效的主题值并设置CSS变量
    updateActualThemeValue() {
      let actualTheme;
      if (this.themeType === 'auto') {
        // 根据系统偏好决定实际主题
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        actualTheme = prefersDarkMode ? 'dark' : 'light';
      } else {
        actualTheme = this.themeType; // 直接使用 'dark' 或 'light'
      }
      this.themeValue = actualTheme; // 更新 Pinia 中的 themeValue

      // 设置 CSS 变量到根元素
      const root = document.documentElement;
      if (actualTheme === 'light') {
        root.style.setProperty('--cursor-bg-color', '#000'); // 浅色模式下光标为黑色
      } else {
        root.style.setProperty('--cursor-bg-color', '#fff'); // 深色模式下光标为白色
      }
      
      // 同时在根元素上添加或移除class，用于全局样式控制
      if (actualTheme === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
      } else {
          root.classList.add('light');
          root.classList.remove('dark');
      }
    },

    // 新增action: 外部触发更新主题（用于系统主题变化）
    triggerThemeUpdate() {
        this.updateActualThemeValue();
        if (appCursorInstance) {
            appCursorInstance.setThemeType(this.themeType);
        }
    }
  },
  // 数据持久化
  persist: [
    {
      key: "siteData",
      paths: [
        "themeType",
        "bannerType",
        "useRightMenu",
        "playerShow",
        "playerVolume",
        "backgroundBlur",
        "backgroundType",
        "fontFamily",
        "fontSize",
        "infoPosition",
        "backgroundUrl",
      ], 
    },
  ],
});

// 在 Pinia store 被创建后，初始化光标并处理主题设置
export const initializeCursor = () => {
  const store = mainStore();

  if (!appCursorInstance) {
    appCursorInstance = cursorInit();
  }

  // 首次初始化时，确保设置正确的 themeValue 和 CSS 变量
  store.updateActualThemeValue();

  // 第一次设置光标样式，使用当前 Pinia store 中的 themeType
  appCursorInstance.setThemeType(store.themeType);

  //新增：监听系统主题偏好变化
  if (window.matchMedia) {
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    // 定义监听器函数
    const handleSystemThemeChange = (e) => {
      // 只有当 themeType 是 'auto' 时才响应系统变化
      if (store.themeType === 'auto') {
        store.triggerThemeUpdate(); // 触发主题更新
      }
    };

    // 添加监听器
    // 使用 addEventListener 是现代推荐的做法，addListener 可能会被弃用
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleSystemThemeChange);
    } else {
      // 兼容旧版浏览器 (例如 Safari < 14)
      mediaQueryList.addListener(handleSystemThemeChange);
    }

    // 可选：在组件销毁时移除监听器，以防内存泄漏（虽然对于全局store通常不是大问题）
    // 但Pinia store通常是全局的，只要应用活着，监听器就可能需要存在。
    // 如果你希望在应用关闭时清理，需要更复杂的逻辑。
  }
};