import { useCallback, useEffect, useState } from 'react'
import Crosshair from './Crosshair'
import RegionEditor from './RegionEditor'
import Settings from './Settings'
import { useSettings } from './store'
import { WindowRegion } from './types'

function Toast({ onClose }: { onClose: () => void }) {
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setOpacity(0), 3500)
    const closeTimer = setTimeout(() => onClose(), 4000)
    return () => { clearTimeout(fadeTimer); clearTimeout(closeTimer) }
  }, [onClose])  // ✅ 의존성 추가

  return (
    <div style={{
      position: 'absolute', top: '40px', left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.75)', color: '#fff',
      borderRadius: '10px', padding: '14px 20px',
      fontSize: '13px', lineHeight: '1.8', whiteSpace: 'nowrap',
      pointerEvents: 'none', zIndex: 999, opacity,
      transition: 'opacity 0.5s ease',
      border: '1px solid rgba(255,255,255,0.1)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ fontWeight: 600, marginBottom: '6px', color: '#4ade80' }}>크로스헤어 오버레이 실행 중</div>
      <div><span style={{ color: '#4ade80', fontWeight: 500 }}>Alt + X</span>　크로스헤어 켜기 / 끄기</div>
      <div><span style={{ color: '#4ade80', fontWeight: 500 }}>Alt + S</span>　설정 창 열기</div>
      <div style={{ marginTop: '6px', color: '#888', fontSize: '12px' }}>트레이 아이콘 우클릭으로도 제어할 수 있어요</div>
    </div>
  )
}

function App() {
  const { settings, updateSettings, resetSettings, profiles, saveProfile, loadProfile, deleteProfile } = useSettings()
  const isSettings = window.electronAPI?.isSettingsWindow?.() ?? false
  const [showToast, setShowToast] = useState(false)

  // ✅ 이중 등록 제거 — store.ts의 useSettings()가 이미 처리함

  useEffect(() => {
    window.electronAPI?.setEditMode?.(settings.editMode)
  }, [settings.editMode])

  useEffect(() => {
    if (isSettings) return
    setShowToast(true)
  }, [])

  const handleRegionChange = useCallback((region: WindowRegion) => {
    updateSettings({ windowRegion: region })
  }, [updateSettings])

  const handleExitEdit = () => {
    updateSettings({ editMode: false })
  }

  if (isSettings) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: 'transparent' }}>
        <Settings
          settings={settings}
          onUpdate={updateSettings}
          onReset={resetSettings}
          profiles={profiles}
          onSaveProfile={saveProfile}
          onLoadProfile={loadProfile}
          onDeleteProfile={deleteProfile}
        />
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'transparent', position: 'relative' }}>
      {showToast && <Toast onClose={() => setShowToast(false)} />}
      {settings.editMode ? (
        <RegionEditor region={settings.windowRegion} onChange={handleRegionChange} onExit={handleExitEdit} />
      ) : (
        <div style={{ opacity: settings.opacity / 100 }}>
          <Crosshair {...settings} />
        </div>
      )}
    </div>
  )
}

export default App