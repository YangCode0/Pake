(function () {
  // ====== 配置区 ======
  const ENABLE_AUTO_LOGIN = true;

  // 登录页关键字
  const LOGIN_URL_KEY = "toLogin.fuiou";

  // 目标客诉页
  const TARGET_HASH = "#//complaint/index.fuiou";
  const TARGET_URL =
    "https://wmp.fuioupay.com/mainNew.fuiou#//complaint/index.fuiou";

  // 自动登录账号密码（自行修改）
  const CS_USER = "MXA565941";
  const CS_PASS = "ANIRH7";

  // 拉回检查间隔（毫秒）
  const GUARD_INTERVAL = 600;

  // ====== 状态 ======
  let cssInjected = false;
  let loginTried = false;
  let firstJumpDone = false;

  /* ================= 工具：是否有弹窗 ================= */
  function hasLayerPopup() {
    // layui layer 弹层/遮罩
    return !!(
      document.querySelector(".layui-layer") ||
      document.querySelector(".layui-layer-shade")
    );
  }

  /* ================= 自动登录 ================= */
  function autoLogin() {
    if (!ENABLE_AUTO_LOGIN || loginTried) return;

    const userInput = document.querySelector('input[name="loginId"]');
    const passInput = document.querySelector('input[name="loginPwd"]');
    const loginBtn = document.querySelector('.btn[lay-filter="login_btn"]');

    if (userInput && passInput && loginBtn) {
      loginTried = true;

      userInput.value = CS_USER;
      passInput.value = CS_PASS;

      // layui 常需要触发 input 事件
      userInput.dispatchEvent(new Event("input", { bubbles: true }));
      passInput.dispatchEvent(new Event("input", { bubbles: true }));

      setTimeout(() => loginBtn.click(), 300);
    }
  }

  /* ================= 隐藏布局元素 + 主体全屏 ================= */
  function injectFullScreenCSS() {
    if (cssInjected) return;

    // 只有进入主框架后再注入
    if (!document.querySelector(".layui-body")) return;

    cssInjected = true;

    const style = document.createElement("style");
    style.setAttribute("data-cs-hide", "1");
    style.innerHTML = `
      .layui-side,
      .layui-header,
      .layui-footer,
      .layui-side-scroll {
        display: none !important;
      }

      /* 兜底隐藏常见导航区域（不存在也无影响） */
      .layui-layout-admin .layui-logo,
      .layui-layout-admin .layui-nav,
      .layui-layout-admin .layui-layout-left,
      .layui-layout-admin .layui-layout-right,
      .layui-layout-admin .layui-nav-item {
        display: none !important;
      }

      /* 主体区域全屏 */
      .layui-body {
        left: 0 !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        position: fixed !important;
        overflow: auto !important;
        padding: 20px !important; /* 想无边距改 0 */
      }

      html, body {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
  }

  /* ================= 首次强制跳到客诉页 ================= */
  function forceFirstJumpToComplaint() {
    if (firstJumpDone) return;

    // 已进入主系统
    if (location.href.includes("mainNew.fuiou")) {
      firstJumpDone = true;

      if (!location.hash.includes("/complaint")) {
        location.href = TARGET_URL;
      }
    }
  }

  /* ================= 保护：离开客诉页就拉回（弹窗期间不拉回） ================= */
  function guardComplaintRoute() {
    // 未进入主系统，不处理
    if (!location.href.includes("mainNew.fuiou")) return;

    // 弹窗存在时，不做拉回，避免 X 关闭不了
    if (hasLayerPopup()) return;

    // 不在 complaint 模块，则拉回
    if (!location.hash.includes("/complaint")) {
      // 用 hash 修改比整页跳转更轻
      location.hash = TARGET_HASH;
    }
  }

  /* =================（可选）仅阻止外部站点 window.open，不拦站内 ================= */
  function limitExternalOpen() {
    if (window.__csOpenLimited__) return;
    window.__csOpenLimited__ = true;

    const originalOpen = window.open;
    window.open = function (url) {
      if (typeof url === "string" && url && !url.includes("wmp.fuioupay.com")) {
        return null;
      }
      return originalOpen ? originalOpen.apply(this, arguments) : null;
    };
  }

function autoSelectLeftProduct() {
  // 只在产品选择页执行
  if (!document.querySelector(".switch-container")) return;

  const leftCard = document.querySelector(
    '.card[data-url="/mainNew.fuiou"]'
  );

  if (leftCard) {
    leftCard.click();
  }
}
  /* ================= 主循环 ================= */
  function init() {
    // 登录页
    if (location.href.includes(LOGIN_URL_KEY)) {
      autoLogin();
      return;
    }
  autoSelectLeftProduct();
    // 主系统页
    if (location.href.includes("mainNew.fuiou")) {
      injectFullScreenCSS();
      limitExternalOpen(); // 不需要就注释掉

      forceFirstJumpToComplaint();
      guardComplaintRoute();
    }
  }

  setInterval(init, GUARD_INTERVAL);
})();