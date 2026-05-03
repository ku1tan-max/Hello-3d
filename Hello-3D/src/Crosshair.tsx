import { CrosshairSettings, CrosshairShape, OutlineColor, WindowRegion } from './types'

interface ShapeProps {
  color: string
  size: number
  thickness: number
  gap: number
  showDot: boolean
  outline: OutlineColor
  outlineThickness: number
  outlineOpacity: number
}

function getOutlineColor(outline: OutlineColor, opacity: number): string | null {
  const a = (opacity / 100).toFixed(2)
  if (outline === 'black') return `rgba(0,0,0,${a})`
  if (outline === 'white') return `rgba(255,255,255,${a})`
  return null
}

function CrossShape({ color, size, thickness, gap, showDot, outline, outlineThickness, outlineOpacity }: ShapeProps) {
  const ol = getOutlineColor(outline, outlineOpacity)
  const ot = outlineThickness

  const barStyle = (w: number, h: number, l: number, t: number): React.CSSProperties => ({
    position: 'absolute', width: `${w}px`, height: `${h}px`,
    background: color, left: `${l}px`, top: `${t}px`,
  })

  const olBarStyle = (w: number, h: number, l: number, t: number): React.CSSProperties => ({
    position: 'absolute',
    width: `${w + ot * 2}px`, height: `${h + ot * 2}px`,
    background: ol!, left: `${l - ot}px`, top: `${t - ot}px`,
  })

  return (
    <>
      {ol && <>
        <div style={olBarStyle(thickness, size, -thickness / 2, -(size + gap))} />
        <div style={olBarStyle(thickness, size, -thickness / 2, gap)} />
        <div style={olBarStyle(size, thickness, -(size + gap), -thickness / 2)} />
        <div style={olBarStyle(size, thickness, gap, -thickness / 2)} />
        {showDot && <div style={{ position: 'absolute', width: `${thickness + 2 + ot * 2}px`, height: `${thickness + 2 + ot * 2}px`, borderRadius: '50%', background: ol, left: `${-(thickness + 2) / 2 - ot}px`, top: `${-(thickness + 2) / 2 - ot}px` }} />}
      </>}
      <div style={barStyle(thickness, size, -thickness / 2, -(size + gap))} />
      <div style={barStyle(thickness, size, -thickness / 2, gap)} />
      <div style={barStyle(size, thickness, -(size + gap), -thickness / 2)} />
      <div style={barStyle(size, thickness, gap, -thickness / 2)} />
      {showDot && <div style={{ position: 'absolute', width: `${thickness + 2}px`, height: `${thickness + 2}px`, borderRadius: '50%', background: color, left: `${-(thickness + 2) / 2}px`, top: `${-(thickness + 2) / 2}px` }} />}
    </>
  )
}

function DotShape({ color, size, outline, outlineThickness, outlineOpacity }: ShapeProps) {
  const ol = getOutlineColor(outline, outlineOpacity)
  const ot = outlineThickness
  return (
    <>
      {ol && <div style={{ position: 'absolute', width: `${size + ot * 2}px`, height: `${size + ot * 2}px`, borderRadius: '50%', background: ol, left: `${-size / 2 - ot}px`, top: `${-size / 2 - ot}px` }} />}
      <div style={{ position: 'absolute', width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: color, left: `${-size / 2}px`, top: `${-size / 2}px` }} />
    </>
  )
}

function XShape({ color, size, thickness, outline, outlineThickness, outlineOpacity }: ShapeProps) {
  const ol = getOutlineColor(outline, outlineOpacity)
  const ot = outlineThickness

  const lineStyle = (rotate: number, bg: string, extra = 0): React.CSSProperties => ({
    position: 'absolute',
    width: `${thickness + extra * 2}px`,
    height: `${size * 2 + extra * 2}px`,
    background: bg,
    left: `${-(thickness + extra * 2) / 2}px`,
    top: `${-size - extra}px`,
    transform: `rotate(${rotate}deg)`,
    transformOrigin: 'center center',
  })

  return (
    <>
      {ol && <>
        <div style={lineStyle(45, ol, ot)} />
        <div style={lineStyle(-45, ol, ot)} />
      </>}
      <div style={lineStyle(45, color)} />
      <div style={lineStyle(-45, color)} />
    </>
  )
}

function CircleShape({ color, size, thickness, outline, outlineThickness, outlineOpacity }: ShapeProps) {
  const ol = getOutlineColor(outline, outlineOpacity)
  const ot = outlineThickness
  return (
    <>
      {ol && <div style={{ position: 'absolute', width: `${size * 2 + ot * 2}px`, height: `${size * 2 + ot * 2}px`, borderRadius: '50%', border: `${thickness + ot * 2}px solid ${ol}`, left: `${-size - ot}px`, top: `${-size - ot}px` }} />}
      <div style={{ position: 'absolute', width: `${size * 2}px`, height: `${size * 2}px`, borderRadius: '50%', border: `${thickness}px solid ${color}`, left: `${-size}px`, top: `${-size}px` }} />
    </>
  )
}

function TShape({ color, size, thickness, gap, outline, outlineThickness, outlineOpacity }: ShapeProps) {
  const ol = getOutlineColor(outline, outlineOpacity)
  const ot = outlineThickness

  const barStyle = (w: number, h: number, l: number, t: number, bg: string, extra = 0): React.CSSProperties => ({
    position: 'absolute',
    width: `${w + extra * 2}px`, height: `${h + extra * 2}px`,
    background: bg, left: `${l - extra}px`, top: `${t - extra}px`,
  })

  return (
    <>
      {ol && <>
        <div style={barStyle(thickness, size, -thickness / 2, gap, ol, ot)} />
        <div style={barStyle(size, thickness, -(size + gap), -thickness / 2, ol, ot)} />
        <div style={barStyle(size, thickness, gap, -thickness / 2, ol, ot)} />
      </>}
      <div style={barStyle(thickness, size, -thickness / 2, gap, color)} />
      <div style={barStyle(size, thickness, -(size + gap), -thickness / 2, color)} />
      <div style={barStyle(size, thickness, gap, -thickness / 2, color)} />
    </>
  )
}

function renderShape(shape: CrosshairShape, props: ShapeProps) {
  switch (shape) {
    case 'cross':  return <CrossShape {...props} />
    case 'dot':    return <DotShape {...props} />
    case 'x':      return <XShape {...props} />
    case 'circle': return <CircleShape {...props} />
    case 'tshape': return <TShape {...props} />
    default:       return <CrossShape {...props} />
  }
}

function Crosshair({
  shape = 'cross',
  color = '#00ff00',
  size = 10,
  thickness = 2,
  gap = 4,
  showDot = true,
  outline = 'none',
  outlineThickness = 1,
  outlineOpacity = 85,
  showGuideBoxes = true,
  guideBoxWidth = 20,
  guideBoxHeight = 20,
  guideBoxColor = '#00ff00',
  guideBoxOpacity = 40,
  windowMode = false,
  windowRegion,
}: Partial<CrosshairSettings>) {
  const region: WindowRegion = windowMode && windowRegion
    ? windowRegion
    : { x: 0, y: 0, width: window.screen.width, height: window.screen.height }

  const centerX = region.x + region.width / 2
  const centerY = region.y + region.height / 2

  const boxBase: React.CSSProperties = {
    position: 'absolute',
    width: `${guideBoxWidth}px`,
    height: `${guideBoxHeight}px`,
    background: guideBoxColor,
    opacity: guideBoxOpacity / 100,
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {showGuideBoxes && (
        <>
          <div style={{ ...boxBase, left: `${centerX - guideBoxWidth / 2}px`, top: `${region.y}px` }} />
          <div style={{ ...boxBase, left: `${centerX - guideBoxWidth / 2}px`, top: `${region.y + region.height - guideBoxHeight}px` }} />
          <div style={{ ...boxBase, left: `${region.x}px`, top: `${centerY - guideBoxHeight / 2}px` }} />
          <div style={{ ...boxBase, left: `${region.x + region.width - guideBoxWidth}px`, top: `${centerY - guideBoxHeight / 2}px` }} />
        </>
      )}
      <div style={{ position: 'absolute', left: `${centerX}px`, top: `${centerY}px`, transform: 'translate(-50%, -50%)' }}>
        {renderShape(shape, { color, size, thickness, gap, showDot, outline, outlineThickness, outlineOpacity })}
      </div>
    </div>
  )
}

export default Crosshair