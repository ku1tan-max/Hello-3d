import { app, BrowserWindow, screen, ipcMain, Tray, Menu, globalShortcut, nativeImage } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow: BrowserWindow
let settingsWindow: BrowserWindow | null = null
let tray: Tray
let isVisible = true
let dragOffset = { x: 0, y: 0 }

function createMainWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().bounds

  mainWindow = new BrowserWindow({
    width, height, x: 0, y: 0,
    transparent: true, frame: false,
    alwaysOnTop: true, skipTaskbar: true, resizable: false,
    webPreferences: {
      preload: join(__dirname, '../dist-electron/preload.mjs'),
      nodeIntegration: false, contextIsolation: true,
    }
  })

  mainWindow.setIgnoreMouseEvents(true, { forward: true })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

function createSettingsWindow(): void {
  if (settingsWindow) { settingsWindow.focus(); return }

  settingsWindow = new BrowserWindow({
    width: 320, height: 520,
    resizable: false, alwaysOnTop: true,
    frame: false, transparent: true, hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../dist-electron/preload.mjs'),
      nodeIntegration: false, contextIsolation: true,
    }
  })

  if (process.env.NODE_ENV === 'development') {
    settingsWindow.loadURL('http://localhost:5173?settings=true')
  } else {
    settingsWindow.loadFile(join(__dirname, '../dist/index.html'), { query: { settings: 'true' } })
  }

  settingsWindow.setMenu(null)
  settingsWindow.on('closed', () => { settingsWindow = null })
}

function createTray(): void {
  const iconPath = join(__dirname, '../../public/crosshair.png')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  tray = new Tray(icon)

  const updateMenu = () => {
    const isAutoLaunch = app.getLoginItemSettings().openAtLogin
    const menu = Menu.buildFromTemplate([
      {
        label: isVisible ? '크로스헤어 끄기' : '크로스헤어 켜기',
        click: () => {
          isVisible = !isVisible
          isVisible ? mainWindow.show() : mainWindow.hide()
          updateMenu()
        }
      },
      { label: '설정 열기', click: () => createSettingsWindow() },
      { type: 'separator' },
      {
        label: '시작 프로그램 등록',
        type: 'checkbox',
        checked: isAutoLaunch,
        click: () => {
          app.setLoginItemSettings({ openAtLogin: !isAutoLaunch, name: '크로스헤어 오버레이' })
          updateMenu()
        }
      },
      { type: 'separator' },
      { label: '종료', click: () => app.quit() }
    ])
    tray.setContextMenu(menu)
  }

  tray.setToolTip('크로스헤어 오버레이')
  tray.on('double-click', () => createSettingsWindow())
  updateMenu()
}

function registerShortcuts(toggle = 'Alt+X', settings = 'Alt+S'): void {
  globalShortcut.unregisterAll()
  try {
    globalShortcut.register(toggle, () => {
      isVisible = !isVisible
      isVisible ? mainWindow.show() : mainWindow.hide()
    })
    globalShortcut.register(settings, () => createSettingsWindow())
  } catch (e) {
    console.error('단축키 등록 실패:', e)
  }
}

app.whenReady().then(() => {
  createMainWindow()
  createTray()
  registerShortcuts()
})

app.on('window-all-closed', () => {})
app.on('will-quit', () => globalShortcut.unregisterAll())

ipcMain.on('set-ignore-mouse', (_, ignore: boolean) => {
  mainWindow.setIgnoreMouseEvents(ignore, { forward: true })
})
ipcMain.on('open-settings', () => createSettingsWindow())
ipcMain.on('update-settings', (_, settings) => {
  if (mainWindow) mainWindow.webContents.send('settings-updated', settings)
})
ipcMain.on('set-edit-mode', (_, enabled: boolean) => {
  mainWindow.setIgnoreMouseEvents(!enabled, { forward: true })
})
ipcMain.on('close-settings', () => settingsWindow?.close())
ipcMain.on('start-drag', (_, { x, y }) => {
  const bounds = settingsWindow?.getBounds()
  if (bounds) dragOffset = { x: x - bounds.x, y: y - bounds.y }
})
ipcMain.on('move-drag', (_, { x, y }) => {
  if (settingsWindow) settingsWindow.setPosition(x - dragOffset.x, y - dragOffset.y)
})
ipcMain.on('update-shortcuts', (_, shortcuts: { toggle: string; settings: string }) => {
  registerShortcuts(shortcuts.toggle, shortcuts.settings)
})