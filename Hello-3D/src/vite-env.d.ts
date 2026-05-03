/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    setIgnoreMouse: (ignore: boolean) => void
    openSettings: () => void
    isSettingsWindow: () => boolean
    sendSettings: (settings: unknown) => void
    onSettingsUpdated: (callback: (settings: unknown) => void) => void
    setEditMode: (enabled: boolean) => void
    closeSettings: () => void
    startDrag: (x: number, y: number) => void
    moveDrag: (x: number, y: number) => void
    updateShortcuts: (shortcuts: { toggle: string, settings: string }) => void
  }
}