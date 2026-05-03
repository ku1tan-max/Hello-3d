import { app as a, globalShortcut as p, ipcMain as r, screen as b, BrowserWindow as f, nativeImage as y, Tray as _, Menu as x } from "electron";
import { dirname as I, join as c } from "path";
import { fileURLToPath as k } from "url";
const v = k(import.meta.url), u = I(v);
let o, t = null, d, i = !0, h = { x: 0, y: 0 };
function M() {
  const { width: n, height: e } = b.getPrimaryDisplay().bounds;
  o = new f({
    width: n,
    height: e,
    x: 0,
    y: 0,
    transparent: !0,
    frame: !1,
    alwaysOnTop: !0,
    skipTaskbar: !0,
    resizable: !1,
    webPreferences: {
      preload: c(u, "../dist-electron/preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), o.setIgnoreMouseEvents(!0, { forward: !0 }), process.env.NODE_ENV === "development" ? o.loadURL("http://localhost:5173") : o.loadFile(c(u, "../dist/index.html"));
}
function g() {
  if (t) {
    t.focus();
    return;
  }
  t = new f({
    width: 320,
    height: 520,
    resizable: !1,
    alwaysOnTop: !0,
    frame: !1,
    transparent: !0,
    hasShadow: !1,
    webPreferences: {
      preload: c(u, "../dist-electron/preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), process.env.NODE_ENV === "development" ? t.loadURL("http://localhost:5173?settings=true") : t.loadFile(c(u, "../dist/index.html"), { query: { settings: "true" } }), t.setMenu(null), t.on("closed", () => {
    t = null;
  });
}
function T() {
  const n = c(u, "../../public/crosshair.png"), e = y.createFromPath(n).resize({ width: 16, height: 16 });
  d = new _(e);
  const s = () => {
    const l = a.getLoginItemSettings().openAtLogin, w = x.buildFromTemplate([
      {
        label: i ? "크로스헤어 끄기" : "크로스헤어 켜기",
        click: () => {
          i = !i, i ? o.show() : o.hide(), s();
        }
      },
      { label: "설정 열기", click: () => g() },
      { type: "separator" },
      {
        label: "시작 프로그램 등록",
        type: "checkbox",
        checked: l,
        click: () => {
          a.setLoginItemSettings({ openAtLogin: !l, name: "크로스헤어 오버레이" }), s();
        }
      },
      { type: "separator" },
      { label: "종료", click: () => a.quit() }
    ]);
    d.setContextMenu(w);
  };
  d.setToolTip("크로스헤어 오버레이"), d.on("double-click", () => g()), s();
}
function m(n = "Alt+X", e = "Alt+S") {
  p.unregisterAll();
  try {
    p.register(n, () => {
      i = !i, i ? o.show() : o.hide();
    }), p.register(e, () => g());
  } catch (s) {
    console.error("단축키 등록 실패:", s);
  }
}
a.whenReady().then(() => {
  M(), T(), m();
});
a.on("window-all-closed", () => {
});
a.on("will-quit", () => p.unregisterAll());
r.on("set-ignore-mouse", (n, e) => {
  o.setIgnoreMouseEvents(e, { forward: !0 });
});
r.on("open-settings", () => g());
r.on("update-settings", (n, e) => {
  o && o.webContents.send("settings-updated", e);
});
r.on("set-edit-mode", (n, e) => {
  o.setIgnoreMouseEvents(!e, { forward: !0 });
});
r.on("close-settings", () => t == null ? void 0 : t.close());
r.on("start-drag", (n, { x: e, y: s }) => {
  const l = t == null ? void 0 : t.getBounds();
  l && (h = { x: e - l.x, y: s - l.y });
});
r.on("move-drag", (n, { x: e, y: s }) => {
  t && t.setPosition(e - h.x, s - h.y);
});
r.on("update-shortcuts", (n, e) => {
  m(e.toggle, e.settings);
});
