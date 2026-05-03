export type CrosshairShape = 'cross' | 'dot' | 'x' | 'circle' | 'tshape'
export type OutlineColor = 'none' | 'black' | 'white'

export interface WindowRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface ShortcutSettings {
  toggle: string
  settings: string
}

export interface CrosshairSettings {
  shape: CrosshairShape
  color: string
  size: number
  thickness: number
  gap: number
  showDot: boolean
  opacity: number
  outline: OutlineColor
  outlineThickness: number
  outlineOpacity: number
  showGuideBoxes: boolean
  guideBoxWidth: number
  guideBoxHeight: number
  guideBoxColor: string
  guideBoxOpacity: number
  windowMode: boolean
  windowRegion: WindowRegion
  editMode: boolean
  shortcuts: ShortcutSettings
}

export interface Profile {
  id: string
  name: string
  settings: CrosshairSettings
}

export const PRESETS: { label: string, region: WindowRegion }[] = [
  { label: '1920×1080', region: { x: 0, y: 0, width: 1920, height: 1080 } },
  { label: '2560×1440', region: { x: 0, y: 0, width: 2560, height: 1440 } },
  { label: '1280×720',  region: { x: 0, y: 0, width: 1280, height: 720  } },
  { label: '1600×900',  region: { x: 0, y: 0, width: 1600, height: 900  } },
]

export const defaultSettings: CrosshairSettings = {
  shape: 'cross',
  color: '#00ff00',
  size: 10,
  thickness: 2,
  gap: 4,
  showDot: true,
  opacity: 100,
  outline: 'none',
  outlineThickness: 1,
  outlineOpacity: 85,
  showGuideBoxes: true,
  guideBoxWidth: 20,
  guideBoxHeight: 20,
  guideBoxColor: '#00ff00',
  guideBoxOpacity: 40,
  windowMode: false,
  windowRegion: { x: 0, y: 0, width: 1920, height: 1080 },
  editMode: false,
  shortcuts: {
    toggle: 'Alt+X',
    settings: 'Alt+S',
  },
}