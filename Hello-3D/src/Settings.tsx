import { useState, useEffect, useRef } from 'react'
import { CrosshairSettings, Profile, PRESETS } from './types'

interface SettingsProps {
  settings: CrosshairSettings
  onUpdate: (partial: Partial<CrosshairSettings>) => void
  onReset: () => void
  profiles: Profile[]
  onSaveProfile: (name: string) => void
  onLoadProfile: (id: string) => void
  onDeleteProfile: (id: string) => void
}

type Tab = 'crosshair' | 'guide' | 'window' | 'profiles'
type CrosshairSubTab = 'basic' | 'outline' | 'advanced'

const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const TABS: { id: Tab, icon: string, label: string }[] = [
  { id: 'crosshair', icon: '✛', label: '조준' },
  { id: 'guide',     icon: '⊞', label: '가이드' },
  { id: 'window',    icon: '⊡', label: '창' },
  { id: 'profiles',  icon: '☰', label: '프로필' },
]

const PRESET_LABELS: Record<string, string> = {
  '1920×1080': 'FHD', '2560×1440': 'QHD',
  '1280×720': 'HD', '1600×900': 'HD+',
}

const Row = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '0.5px solid #f5f5f5' }}>
    <span style={{ fontSize: '12px', color: '#555', fontFamily: font }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{children}</div>
  </div>
)

const Slider = ({ min, max, value, onChange }: { min: number, max: number, value: number, onChange: (v: number) => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <input type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100px', accentColor: '#16a34a' }} />
    <span style={{ fontSize: '11px', color: '#bbb', minWidth: '24px', textAlign: 'right', fontFamily: font }}>{value}</span>
  </div>
)

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
  <div onClick={() => onChange(!checked)} style={{
    width: '34px', height: '19px', borderRadius: '10px',
    background: checked ? '#16a34a' : '#e5e5e5',
    position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
  }}>
    <div style={{
      width: '15px', height: '15px', borderRadius: '50%', background: '#fff',
      position: 'absolute', top: '2px',
      left: checked ? '17px' : '2px',
      transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
    }} />
  </div>
)

const ShapeGrid = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
  <div style={{ padding: '6px 0' }}>
    <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.07em', color: '#bbb', textTransform: 'uppercase', marginBottom: '8px' }}>모양</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
      {([
        { id: 'cross', label: '십자' }, { id: 'dot', label: '점' },
        { id: 'x', label: 'X자' }, { id: 'circle', label: '원형' },
        { id: 'tshape', label: 'T자' },
      ] as const).map(s => {
        const isActive = value === s.id
        return (
          <div key={s.id} onClick={() => onChange(s.id)} style={{
            padding: '8px 4px',
            background: isActive ? '#f0fdf4' : '#fafafa',
            border: isActive ? '1px solid #bbf7d0' : '0.5px solid #eee',
            borderRadius: '7px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = '#d1fae5' }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#eee' }}
          >
            <div style={{ fontSize: '10px', fontWeight: 500, color: isActive ? '#16a34a' : '#888' }}>{s.label}</div>
          </div>
        )
      })}
    </div>
  </div>
)

function Preview({ settings }: { settings: CrosshairSettings }) {
  const { shape, color, size, thickness, gap, showDot, outline, outlineThickness, outlineOpacity, opacity } = settings
  const getOl = () => {
    const a = (outlineOpacity / 100).toFixed(2)
    if (outline === 'black') return `rgba(0,0,0,${a})`
    if (outline === 'white') return `rgba(255,255,255,${a})`
    return null
  }
  const ol = getOl()
  const ot = outlineThickness

  const renderPreview = () => {
    switch (shape) {
      case 'cross': return (
        <>
          {ol && <>
            <div style={{ position: 'absolute', width: `${thickness + ot * 2}px`, height: `${size + ot * 2}px`, background: ol, left: `${-thickness / 2 - ot}px`, top: `${-(size + gap) - ot}px` }} />
            <div style={{ position: 'absolute', width: `${thickness + ot * 2}px`, height: `${size + ot * 2}px`, background: ol, left: `${-thickness / 2 - ot}px`, top: `${gap - ot}px` }} />
            <div style={{ position: 'absolute', width: `${size + ot * 2}px`, height: `${thickness + ot * 2}px`, background: ol, left: `${-(size + gap) - ot}px`, top: `${-thickness / 2 - ot}px` }} />
            <div style={{ position: 'absolute', width: `${size + ot * 2}px`, height: `${thickness + ot * 2}px`, background: ol, left: `${gap - ot}px`, top: `${-thickness / 2 - ot}px` }} />
          </>}
          <div style={{ position: 'absolute', width: `${thickness}px`, height: `${size}px`, background: color, left: `${-thickness / 2}px`, top: `${-(size + gap)}px` }} />
          <div style={{ position: 'absolute', width: `${thickness}px`, height: `${size}px`, background: color, left: `${-thickness / 2}px`, top: `${gap}px` }} />
          <div style={{ position: 'absolute', width: `${size}px`, height: `${thickness}px`, background: color, left: `${-(size + gap)}px`, top: `${-thickness / 2}px` }} />
          <div style={{ position: 'absolute', width: `${size}px`, height: `${thickness}px`, background: color, left: `${gap}px`, top: `${-thickness / 2}px` }} />
          {showDot && <div style={{ position: 'absolute', width: `${thickness + 2}px`, height: `${thickness + 2}px`, borderRadius: '50%', background: color, left: `${-(thickness + 2) / 2}px`, top: `${-(thickness + 2) / 2}px` }} />}
        </>
      )
      case 'dot': return (
        <>
          {ol && <div style={{ position: 'absolute', width: `${size + ot * 2}px`, height: `${size + ot * 2}px`, borderRadius: '50%', background: ol, left: `${-size / 2 - ot}px`, top: `${-size / 2 - ot}px` }} />}
          <div style={{ position: 'absolute', width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: color, left: `${-size / 2}px`, top: `${-size / 2}px` }} />
        </>
      )
      case 'x': return (
        <>
          {ol && <>
            <div style={{ position: 'absolute', width: `${thickness + ot * 2}px`, height: `${size * 2 + ot * 2}px`, background: ol, left: `${-(thickness + ot * 2) / 2}px`, top: `${-size - ot}px`, transform: 'rotate(45deg)', transformOrigin: 'center' }} />
            <div style={{ position: 'absolute', width: `${thickness + ot * 2}px`, height: `${size * 2 + ot * 2}px`, background: ol, left: `${-(thickness + ot * 2) / 2}px`, top: `${-size - ot}px`, transform: 'rotate(-45deg)', transformOrigin: 'center' }} />
          </>}
          <div style={{ position: 'absolute', width: `${thickness}px`, height: `${size * 2}px`, background: color, left: `${-thickness / 2}px`, top: `${-size}px`, transform: 'rotate(45deg)', transformOrigin: 'center' }} />
          <div style={{ position: 'absolute', width: `${thickness}px`, height: `${size * 2}px`, background: color, left: `${-thickness / 2}px`, top: `${-size}px`, transform: 'rotate(-45deg)', transformOrigin: 'center' }} />
        </>
      )
      case 'circle': return (
        <>
          {ol && <div style={{ position: 'absolute', width: `${size * 2 + ot * 2}px`, height: `${size * 2 + ot * 2}px`, borderRadius: '50%', border: `${thickness + ot * 2}px solid ${ol}`, left: `${-size - ot}px`, top: `${-size - ot}px` }} />}
          <div style={{ position: 'absolute', width: `${size * 2}px`, height: `${size * 2}px`, borderRadius: '50%', border: `${thickness}px solid ${color}`, left: `${-size}px`, top: `${-size}px` }} />
        </>
      )
      case 'tshape': return (
        <>
          {ol && <>
            <div style={{ position: 'absolute', width: `${thickness + ot * 2}px`, height: `${size + ot * 2}px`, background: ol, left: `${-thickness / 2 - ot}px`, top: `${gap - ot}px` }} />
            <div style={{ position: 'absolute', width: `${size + ot * 2}px`, height: `${thickness + ot * 2}px`, background: ol, left: `${-(size + gap) - ot}px`, top: `${-thickness / 2 - ot}px` }} />
            <div style={{ position: 'absolute', width: `${size + ot * 2}px`, height: `${thickness + ot * 2}px`, background: ol, left: `${gap - ot}px`, top: `${-thickness / 2 - ot}px` }} />
          </>}
          <div style={{ position: 'absolute', width: `${thickness}px`, height: `${size}px`, background: color, left: `${-thickness / 2}px`, top: `${gap}px` }} />
          <div style={{ position: 'absolute', width: `${size}px`, height: `${thickness}px`, background: color, left: `${-(size + gap)}px`, top: `${-thickness / 2}px` }} />
          <div style={{ position: 'absolute', width: `${size}px`, height: `${thickness}px`, background: color, left: `${gap}px`, top: `${-thickness / 2}px` }} />
        </>
      )
    }
  }

  return (
    <div style={{
      width: '100%', height: '70px', background: '#111',
      borderRadius: '8px', margin: '6px 0',
      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
      <div style={{ position: 'relative', opacity: opacity / 100 }}>{renderPreview()}</div>
    </div>
  )
}

function Settings({ settings, onUpdate, onReset, profiles, onSaveProfile, onLoadProfile, onDeleteProfile }: SettingsProps) {
  const [tab, setTab] = useState<Tab>('crosshair')
  const [subTab, setSubTab] = useState<CrosshairSubTab>('basic')
  const [newProfileName, setNewProfileName] = useState('')
  const [recordingKey, setRecordingKey] = useState<'toggle' | 'settings' | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .profile-list::-webkit-scrollbar { width: 4px; }
      .profile-list::-webkit-scrollbar-track { background: transparent; }
      .profile-list::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 99px; }
      .profile-list::-webkit-scrollbar-thumb:hover { background: #d1d1d1; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const currentPreset = PRESETS.find(p =>
    p.region.width === settings.windowRegion.width &&
    p.region.height === settings.windowRegion.height
  )

  useEffect(() => {
    if (!recordingKey) return
    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      if (e.key === 'Escape') { setRecordingKey(null); return }
      const parts = []
      if (e.ctrlKey) parts.push('Ctrl')
      if (e.altKey) parts.push('Alt')
      if (e.shiftKey) parts.push('Shift')
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) parts.push(key)
      if (parts.length > 1) {
        const combo = parts.join('+')
        const newShortcuts = { ...settings.shortcuts, [recordingKey]: combo }
        onUpdate({ shortcuts: newShortcuts })
        window.electronAPI?.updateShortcuts?.(newShortcuts)
        setRecordingKey(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [recordingKey, settings.shortcuts, onUpdate])

  const subTabStyle = (t: CrosshairSubTab): React.CSSProperties => ({
    flex: 1, padding: '5px 0', textAlign: 'center',
    fontSize: '10px', fontWeight: 500, fontFamily: font,
    cursor: 'pointer', border: 'none', borderRadius: '5px',
    background: subTab === t ? '#f0fdf4' : 'transparent',
    color: subTab === t ? '#16a34a' : '#bbb',
    transition: 'all 0.15s',
  })

  return (
    <div style={{
      width: '100%', background: '#fff',
      display: 'flex', flexDirection: 'column',
      fontFamily: font, borderRadius: '12px',
      border: '0.5px solid #e8e8e8', overflow: 'hidden',
    }}>

      {/* 타이틀바 */}
      <div
        onMouseDown={e => {
          if ((e.target as HTMLElement).closest('[data-no-drag]')) return
          window.electronAPI?.startDrag?.(e.screenX, e.screenY)
          const onMove = (ev: MouseEvent) => window.electronAPI?.moveDrag?.(ev.screenX, ev.screenY)
          const onUp = () => window.removeEventListener('mousemove', onMove)
          window.addEventListener('mousemove', onMove)
          window.addEventListener('mouseup', onUp, { once: true })
        }}
        style={{ padding: '13px 16px', borderBottom: '0.5px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'grab', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111', letterSpacing: '-0.01em' }}>크로스헤어 설정</span>
        </div>
        <div data-no-drag="" onClick={() => window.electronAPI?.closeSettings?.()}
          style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11px', color: '#bbb', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#ffcdd2'}
          onMouseLeave={e => e.currentTarget.style.background = '#f5f5f5'}
        >✕</div>
      </div>

      {/* 바디 */}
      <div style={{ display: 'flex' }}>

        {/* 사이드바 */}
        <div style={{ width: '58px', borderRight: '0.5px solid #f0f0f0', display: 'flex', flexDirection: 'column', padding: '8px 0', gap: '2px', flexShrink: 0 }}>
          {TABS.map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0', gap: '3px', cursor: 'pointer' }}>
              {tab === t.id && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '28px', background: '#16a34a', borderRadius: '0 3px 3px 0' }} />}
              <span style={{ fontSize: '15px', lineHeight: 1 }}>{t.icon}</span>
              <span style={{ fontSize: '9px', fontWeight: 500, color: tab === t.id ? '#16a34a' : '#ccc', transition: 'color 0.15s' }}>{t.label}</span>
            </div>
          ))}
        </div>

          {/* 컨텐츠 */}
          <div ref={contentRef} style={{
            flex: 1,
            padding: '6px 16px 16px',
            minHeight: 0,
            overflowY: 'auto',           // ✅ 추가
            maxHeight: 'calc(480px - 48px)',  // ✅ 타이틀바 높이 빼기
            scrollbarWidth: 'thin',      // ✅ Firefox
            scrollbarColor: '#e5e5e5 transparent',
          }}>
          {/* 크로스헤어 탭 */}
          {tab === 'crosshair' && (
            <>
              <Preview settings={settings} />
              <div style={{ display: 'flex', gap: '3px', margin: '6px 0 8px', background: '#f8f8f8', padding: '3px', borderRadius: '8px' }}>
                <button style={subTabStyle('basic')} onClick={() => setSubTab('basic')}>기본</button>
                <button style={subTabStyle('outline')} onClick={() => setSubTab('outline')}>외곽선</button>
                <button style={subTabStyle('advanced')} onClick={() => setSubTab('advanced')}>고급</button>
              </div>
              {subTab === 'basic' && (
                <>
                  <ShapeGrid value={settings.shape} onChange={v => onUpdate({ shape: v as CrosshairSettings['shape'] })} />
                  <Row label="색상">
                    <input type="color" value={settings.color} onChange={e => onUpdate({ color: e.target.value })}
                      style={{ width: '32px', height: '22px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                  </Row>
                  <Row label="크기"><Slider min={4} max={40} value={settings.size} onChange={v => onUpdate({ size: v })} /></Row>
                  <Row label="두께"><Slider min={1} max={8} value={settings.thickness} onChange={v => onUpdate({ thickness: v })} /></Row>
                  <Row label="간격"><Slider min={0} max={20} value={settings.gap} onChange={v => onUpdate({ gap: v })} /></Row>
                </>
              )}
              {subTab === 'outline' && (
                <>
                  <Row label="외곽선">
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(['none', 'black', 'white'] as const).map(o => {
                        const isActive = settings.outline === o
                        const labels = { none: '없음', black: '검정', white: '흰색' }
                        return (
                          <div key={o} onClick={() => onUpdate({ outline: o })} style={{
                            padding: '4px 8px', fontSize: '11px', fontWeight: 500, borderRadius: '6px', cursor: 'pointer',
                            background: isActive ? '#f0fdf4' : '#fafafa',
                            border: isActive ? '1px solid #bbf7d0' : '0.5px solid #eee',
                            color: isActive ? '#16a34a' : '#888', transition: 'all 0.15s',
                          }}>{labels[o]}</div>
                        )
                      })}
                    </div>
                  </Row>
                  {settings.outline !== 'none' && (
                    <>
                      <Row label="두께"><Slider min={1} max={4} value={settings.outlineThickness} onChange={v => onUpdate({ outlineThickness: v })} /></Row>
                      <Row label="투명도"><Slider min={10} max={100} value={settings.outlineOpacity} onChange={v => onUpdate({ outlineOpacity: v })} /></Row>
                    </>
                  )}
                </>
              )}
              {subTab === 'advanced' && (
                <>
                  <Row label="투명도"><Slider min={10} max={100} value={settings.opacity} onChange={v => onUpdate({ opacity: v })} /></Row>
                  <Row label="중앙 점"><Toggle checked={settings.showDot} onChange={v => onUpdate({ showDot: v })} /></Row>
                </>
              )}
            </>
          )}

          {/* 가이드 박스 탭 */}
          {tab === 'guide' && (
            <>
              <Row label="표시"><Toggle checked={settings.showGuideBoxes} onChange={v => onUpdate({ showGuideBoxes: v })} /></Row>
              <Row label="색상">
                <input type="color" value={settings.guideBoxColor} onChange={e => onUpdate({ guideBoxColor: e.target.value })}
                  style={{ width: '32px', height: '22px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
              </Row>
              <Row label="가로"><Slider min={4} max={60} value={settings.guideBoxWidth} onChange={v => onUpdate({ guideBoxWidth: v })} /></Row>
              <Row label="세로"><Slider min={4} max={60} value={settings.guideBoxHeight} onChange={v => onUpdate({ guideBoxHeight: v })} /></Row>
              <Row label="투명도"><Slider min={5} max={100} value={settings.guideBoxOpacity} onChange={v => onUpdate({ guideBoxOpacity: v })} /></Row>
            </>
          )}

          {/* 창 모드 탭 */}
          {tab === 'window' && (
            <>
              <Row label="창 모드"><Toggle checked={settings.windowMode} onChange={v => onUpdate({ windowMode: v })} /></Row>
              {settings.windowMode && (
                <>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.07em', color: '#bbb', textTransform: 'uppercase', margin: '14px 0 8px' }}>해상도 프리셋</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                    {PRESETS.map(p => {
                      const isActive = currentPreset?.label === p.label
                      return (
                        <div key={p.label} onClick={() => onUpdate({ windowRegion: p.region })} style={{
                          padding: '9px 10px', background: isActive ? '#f0fdf4' : '#fafafa',
                          border: isActive ? '1px solid #bbf7d0' : '0.5px solid #eee',
                          borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                        }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = '#d1fae5' }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#eee' }}
                        >
                          <div style={{ fontSize: '11px', fontWeight: 600, color: isActive ? '#16a34a' : '#222' }}>{p.label}</div>
                          <div style={{ fontSize: '10px', color: '#bbb', marginTop: '1px' }}>{PRESET_LABELS[p.label] ?? ''}</div>
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={() => onUpdate({ editMode: true })}
                    style={{ width: '100%', padding: '9px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, fontFamily: font }}
                    onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                  >영역 직접 수정하기</button>
                </>
              )}
            </>
          )}

          {/* 프로필 탭 */}
          {tab === 'profiles' && (
            <>
              <div style={{ padding: '10px 0 6px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.07em', color: '#bbb', textTransform: 'uppercase', marginBottom: '8px' }}>현재 설정 저장</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" value={newProfileName} onChange={e => setNewProfileName(e.target.value)}
                    placeholder="프로필 이름 입력"
                    onKeyDown={e => { if (e.key === 'Enter' && newProfileName.trim()) { onSaveProfile(newProfileName.trim()); setNewProfileName('') } }}
                    style={{ flex: 1, padding: '8px 10px', fontSize: '12px', border: '0.5px solid #eee', borderRadius: '7px', outline: 'none', fontFamily: font, color: '#333' }}
                  />
                  <button onClick={() => { if (newProfileName.trim()) { onSaveProfile(newProfileName.trim()); setNewProfileName('') } }}
                    style={{ padding: '8px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, fontFamily: font }}
                  >저장</button>
                </div>
              </div>

              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.07em', color: '#bbb', textTransform: 'uppercase', margin: '14px 0 8px' }}>저장된 프로필</div>

              {profiles.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '12px', color: '#ccc' }}>저장된 프로필이 없어요</div>
              ) : (
                <div className="profile-list" style={{
                  display: 'flex', flexDirection: 'column', gap: '6px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#e5e5e5 transparent',
                }}>
                  {profiles.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#fafafa', border: '0.5px solid #eee', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
                          <div style={{ position: 'relative', width: '2px', height: '8px', background: p.settings.color }} />
                          <div style={{ position: 'absolute', width: '8px', height: '2px', background: p.settings.color }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>{p.name}</div>
                          <div style={{ fontSize: '10px', color: '#bbb', marginTop: '1px' }}>{p.settings.shape} · {p.settings.size}px</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => onLoadProfile(p.id)}
                          style={{ padding: '4px 10px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 500, fontFamily: font }}
                          onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                          onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                        >적용</button>
                        <button onClick={() => onDeleteProfile(p.id)}
                          style={{ padding: '4px 10px', background: '#fff', color: '#ddd', border: '0.5px solid #eee', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontFamily: font }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffcdd2'; e.currentTarget.style.color = '#f87171' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.color = '#ddd' }}
                        >삭제</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 단축키 커스텀 */}
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.07em', color: '#bbb', textTransform: 'uppercase', margin: '16px 0 8px' }}>단축키</div>
              {(['toggle', 'settings'] as const).map(key => {
                const labels = { toggle: '켜기 / 끄기', settings: '설정 창 열기' }
                const isRecording = recordingKey === key
                return (
                  <Row key={key} label={labels[key]}>
                    <div
                      onClick={() => setRecordingKey(isRecording ? null : key)}
                      style={{
                        padding: '4px 10px', fontSize: '11px', fontWeight: 500,
                        borderRadius: '6px', cursor: 'pointer', fontFamily: font,
                        background: isRecording ? '#fef9c3' : '#f8f8f8',
                        border: isRecording ? '1px solid #fde68a' : '0.5px solid #eee',
                        color: isRecording ? '#92400e' : '#555',
                        transition: 'all 0.15s', minWidth: '70px', textAlign: 'center',
                      }}
                    >
                      {isRecording ? '입력 중...' : settings.shortcuts[key]}
                    </div>
                  </Row>
                )
              })}
              <div style={{ fontSize: '10px', color: '#ccc', marginTop: '6px' }}>버튼 클릭 후 원하는 단축키를 눌러요</div>
            </>
          )}

          {/* 초기화 */}
          <button onClick={onReset}
            style={{ width: '100%', marginTop: '16px', padding: '9px', background: 'transparent', color: '#ddd', border: '0.5px solid #eee', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: font }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.color = '#aaa' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.color = '#ddd' }}
          >기본값으로 초기화</button>
        </div>
      </div>
    </div>
  )
}

export default Settings