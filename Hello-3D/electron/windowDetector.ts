import koffi from 'koffi'

let user32: ReturnType<typeof koffi.load> | null = null

function getUser32() {
  if (!user32) user32 = koffi.load('user32.dll')
  return user32
}

export interface DetectedWindow {
  x: number
  y: number
  width: number
  height: number
  title: string
}

export function detectWindowAtPoint(x: number, y: number): DetectedWindow | null {
  try {
    const lib = getUser32()

    const WindowFromPoint = lib.func('HWND WindowFromPoint(int x, int y)')
    const GetAncestor = lib.func('HWND GetAncestor(HWND hwnd, uint gaFlags)')
    const GetWindowRect = lib.func('bool GetWindowRect(HWND hWnd, _Out_ RECT* lpRect)')
    const GetWindowTextW = lib.func('int GetWindowTextW(HWND hWnd, char16_t* lpString, int nMaxCount)')

    // 클릭 좌표에서 창 핸들 가져오기
    const hwnd = WindowFromPoint(x, y)
    if (!hwnd) return null

    // 최상위 부모 창 가져오기 (GA_ROOTOWNER = 3)
    const rootHwnd = GetAncestor(hwnd, 3)
    const targetHwnd = rootHwnd || hwnd

    // 창 크기 가져오기
    const rect = { left: 0, top: 0, right: 0, bottom: 0 }
    GetWindowRect(targetHwnd, rect)

    // 창 제목 가져오기
    const titleBuf = Buffer.alloc(512)
    GetWindowTextW(targetHwnd, titleBuf, 256)
    const title = titleBuf.toString('utf16le').replace(/\0/g, '').trim()

    return {
      x: rect.left,
      y: rect.top,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
      title: title || '이름 없는 창',
    }
  } catch (e) {
    console.error('windowDetector error:', e)
    return null
  }
}