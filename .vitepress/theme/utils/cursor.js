import { isEqual } from "lodash-es";

let mainCursor;

const lerp = (a, b, n) => {
  if (Math.round(a) === b) {
    return b;
  }
  return (1 - n) * a + n * b;
};

const getStyle = (el, attr) => {
  try {
    return window.getComputedStyle ? window.getComputedStyle(el)[attr] : el.currentStyle[attr];
  } catch (e) {
    console.error(e);
  }
  return false;
};

const cursorInit = () => {
  mainCursor = new Cursor();
  return mainCursor;
};

class Cursor {
  constructor() {
    this.pos = {
      curr: null,
      prev: null,
    };
    this.pt = [];
    this.currentThemeType = 'auto'; // 初始值可以设置为 'auto'
    this.create();
    this.init();
    this.render();
  }

  move(left, top) {
    this.cursor.style["left"] = `${left}px`;
    this.cursor.style["top"] = `${top}px`;
  }

  create() {
    if (!this.cursor) {
      this.cursor = document.createElement("div");
      this.cursor.id = "cursor";
      this.cursor.classList.add("xs-hidden");
      this.cursor.classList.add("hidden");
      document.body.append(this.cursor);
    }

    const isMobile = /Mobi|Android/i.test(navigator.userAgent) 

    if (isMobile) {
      this.cursor.classList.add("hidden"); 
      if (this.scr) {
        this.scr.remove();
      }
      document.body.style.cursor = 'auto'; 
      return; 
    }

    var el = document.getElementsByTagName("*");
    for (let i = 0; i < el.length; i++)
      if (getStyle(el[i], "cursor") == "pointer") this.pt.push(el[i].outerHTML);

    if (!this.scr) { // 确保只创建一次style标签
      document.body.appendChild((this.scr = document.createElement("style")));
    }
    // 初始光标样式将由外部调用 setThemeType 来设置
  }

  // 修改 updateCursorStyle 方法，接受一个主题类型参数
  updateCursorStyle(themeType) {
    let cursorColor;
    if (themeType === 'auto') {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      cursorColor = prefersDarkMode ? 'white' : 'black';
    } else {
      cursorColor = themeType === 'dark' ? 'white' : 'black';
    }
    this.scr.innerHTML = `* {cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='10px' height='10px'><circle cx='4' cy='4' r='4' fill='${cursorColor}' /></svg>") 4 4, auto !important}`;
  }

  // 新增方法：外部调用以更新主题
  setThemeType(newThemeType) {
    this.currentThemeType = newThemeType;
    if (this.cursor && !/Mobi|Android/i.test(navigator.userAgent)) { 
        this.updateCursorStyle(newThemeType);
    }
  }

  refresh() {
    this.scr.remove();
    this.cursor.classList.remove("active");
    this.pos = {
      curr: null,
      prev: null,
    };
    this.pt = [];

    this.create();
    this.init();
    this.render();
  }

  init() {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent) 
    if (isMobile) {
        return;
    }

    document.onmousemove = (e) => {
      this.pos.curr == null && this.move(e.clientX - 8, e.clientY - 8);
      this.pos.curr = {
        x: e.clientX - 8,
        y: e.clientY - 8,
      };
      this.cursor.classList.remove("hidden");
      this.render();
    };
    document.onmouseenter = () => this.cursor.classList.remove("hidden");
    document.onmouseleave = () => this.cursor.classList.add("hidden");
    document.onmousedown = () => this.cursor.classList.add("active");
    document.onmouseup = () => this.cursor.classList.remove("active");
  }

  render() {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent) 
    if (isMobile) {
        return;
    }

    if (this.pos.prev) {
      this.pos.prev.x = lerp(this.pos.prev.x, this.pos.curr.x, 0.35);
      this.pos.prev.y = lerp(this.pos.prev.y, this.pos.curr.y, 0.35);
      this.move(this.pos.prev.x, this.pos.prev.y);
    } else {
      this.pos.prev = this.pos.curr;
    }
    if (!isEqual(this.pos.curr, this.pos.prev)) {
      requestAnimationFrame(() => this.render());
    }
  }
}

export default cursorInit;