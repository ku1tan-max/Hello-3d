import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouse: (ignore: boolean) => ipcRenderer.send('set-ignore-mouse', ignore),
  openSettings: () => ipcRenderer.send('open-settings'),
  isSettingsWindow: () => new URLSearchParams(window.location.search).get('settings') === 'true',
  sendSettings: (settings: unknown) => ipcRenderer.send('update-settings', settings),
  onSettingsUpdated: (callback: (settings: unknown) => void) => {
    const listener = (_: Electron.IpcRendererEvent, settings: unknown) => callback(settings)
    ipcRenderer.on('settings-updated', listener)
    return () => ipcRenderer.removeListener('settings-updated', listener)  // ✅ cleanup 반환
  },
  setEditMode: (enabled: boolean) => ipcRenderer.send('set-edit-mode', enabled),
  closeSettings: () => ipcRenderer.send('close-settings'),
  startDrag: (x: number, y: number) => ipcRenderer.send('start-drag', { x, y }),
  moveDrag: (x: number, y: number) => ipcRenderer.send('move-drag', { x, y }),
  updateShortcuts: (shortcuts: { toggle: string, settings: string }) => ipcRenderer.send('update-shortcuts', shortcuts),
})