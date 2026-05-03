import { useState, useEffect } from 'react'
import { CrosshairSettings, defaultSettings, Profile } from './types'

const STORAGE_KEY = 'crosshair-settings'
const PROFILES_KEY = 'crosshair-profiles'

export function useSettings() {
  const [settings, setSettings] = useState<CrosshairSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
    } catch {
      return defaultSettings
    }
  })

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem(PROFILES_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    if (window.electronAPI?.isSettingsWindow?.()) {
      window.electronAPI.sendSettings(settings)
    }
  }, [settings])

  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  }, [profiles])

  useEffect(() => {
    if (window.electronAPI?.isSettingsWindow?.()) return

    const cleanup = window.electronAPI?.onSettingsUpdated?.((incoming) => {
      setSettings(prev => ({ ...prev, ...(incoming as CrosshairSettings) }))
    }) as (() => void) | undefined

    return () => { cleanup?.() }
  }, [])

  const updateSettings = (partial: Partial<CrosshairSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }))
  }

  const resetSettings = () => setSettings(defaultSettings)

  const loadProfile = (id: string) => {
    const profile = profiles.find(p => p.id === id)
    if (profile) {
      const { editMode, ...safeSettings } = profile.settings as CrosshairSettings & { editMode?: boolean }
      setSettings(prev => ({ ...prev, ...safeSettings, editMode: false }))
    }
  }

  
  const saveProfile = (name: string) => {
    const { editMode, ...settingsToSave } = settings
    const newProfile: Profile = {
      id: Date.now().toString(),
      name,
      settings: { ...settingsToSave } as CrosshairSettings,
    }
    setProfiles(prev => [...prev, newProfile])
  }
  
  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id))
  }

  return { settings, updateSettings, resetSettings, profiles, saveProfile, loadProfile, deleteProfile }
}