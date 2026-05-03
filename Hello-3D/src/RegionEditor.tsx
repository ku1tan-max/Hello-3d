import { useRef, useEffect, useCallback } from 'react'
import { WindowRegion } from './types'

interface RegionEditorProps {
  region: WindowRegion
  onChange: (region: WindowRegion) => void
  onExit: () => void
}

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move'

const HANDLE_SIZE = 12
const MIN_SIZE = 100

function RegionEditor({ region, onChange, onExit }: RegionEditorProps) {
  const dragging = useRef<{
    handle: Handle
    startX: number
    startY: number
    startRegion: WindowRegion
  } | null>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: Handle) => {
    e.stopPropagation()
    e.preventDefault()
    dragging.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRegion: { ...region },
    }
  }, [region])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const { handle, startX, startY, startRegion } = dragging.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      let { x, y, width, height } = startRegion

      if (handle === 'move') {
        x += dx
        y += dy
      }
      if (handle === 'e'  || handle === 'ne' || handle === 'se') width  = Math.max(MIN_SIZE, width + dx)
      if (handle === 's'  || handle === 'se' || handle === 'sw') height = Math.max(MIN_SIZE, height + dy)
      if (handle === 'w'  || handle === 'nw' || handle === 'sw') {
        const newWidth = Math.max(MIN_SIZE, width - dx)
        x = x + (width - newWidth)
        width = newWidth
      }
      if (handle === 'n'  || handle === 'nw' || handle === 'ne') {
        const newHeight = Math.max(MIN_SIZE, height - dy)
        y = y + (height - newHeight)
        height = newHeight
      }

      onChange({ x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) })
    }

    const onMouseUp = () => { dragging.current = null }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onChange])

  const { x, y, width, height } = region
  const hw = HANDLE_SIZE / 2

  const handles: { id: Handle, cx: number, cy: number, cursor: string }[] = [
    { id: 'nw', cx: x,             cy: y,              cursor: 'nw-resize' },
    { id: 'n',  cx: x + width / 2, cy: y,              cursor: 'n-resize'  },
    { id: 'ne', cx: x + width,     cy: y,              cursor: 'ne-resize' },
    { id: 'e',  cx: x + width,     cy: y + height / 2, cursor: 'e-resize'  },
    { id: 'se', cx: x + width,     cy: y + height,     cursor: 'se-resize' },
    { id: 's',  cx: x + width / 2, cy: y + height,     cursor: 's-resize'  },
    { id: 'sw', cx: x,             cy: y + height,     cursor: 'sw-resize' },
    { id: 'w',  cx: x,             cy: y + height / 2, cursor: 'w-resize'  },
  ]

  return (
    <div style={{ position: 'absolute', inset: 0 }}>

      {/* 어두운 마스크 - 영역 바깥 */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <mask id="cutout">
            <rect width="100%" height="100%" fill="white" />
            <rect x={x} y={y} width={width} height={height} fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.45)" mask="url(#cutout)" />
      </svg>

      {/* 영역 테두리 + 이동 핸들 */}
      <div
        onMouseDown={e => handleMouseDown(e, 'move')}
        style={{
          position: 'absolute',
          left: x, top: y, width, height,
          border: '2px solid #4ade80',
          boxSizing: 'border-box',
          cursor: 'move',
        }}
      />

      {/* 중앙 좌표 표시 */}
      <div style={{
        position: 'absolute',
        left: x + width / 2,
        top: y + height / 2,
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0,0,0,0.7)',
        color: '#4ade80',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}>
        {width} × {height}  ({x}, {y})
      </div>

      {/* 8방향 핸들 */}
      {handles.map(h => (
        <div
          key={h.id}
          onMouseDown={e => handleMouseDown(e, h.id)}
          style={{
            position: 'absolute',
            left: h.cx - hw,
            top: h.cy - hw,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            background: '#4ade80',
            border: '2px solid #000',
            borderRadius: '3px',
            cursor: h.cursor,
            boxSizing: 'border-box',
          }}
        />
      ))}

    {/* 완료 버튼 */}
    <div
    onClick={onExit}
    style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#4ade80',
        color: '#000',
        padding: '8px 24px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        zIndex: 10,
    }}
    >
    완료
    </div>
</div>
  )
}

export default RegionEditor