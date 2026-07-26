export interface PracticeViewport {
  width: number
  height: number
  safeTop?: number
  safeBottom?: number
  safeLeft?: number
  safeRight?: number
}

export type PracticeLayoutMode = 'portrait' | 'phone-landscape' | 'tablet-landscape'

export interface PracticeLayoutMetrics {
  mode: PracticeLayoutMode
  canvasSide: number
  availableWidth: number
  availableHeight: number
  viewportWidth: number
  viewportHeight: number
  headerHeight: number
  panelWidth: number
  gap: number
  outerMargin: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function calculatePracticeLayout(viewport: PracticeViewport): PracticeLayoutMetrics {
  const safeTop = Math.max(0, viewport.safeTop ?? 0)
  const safeBottom = Math.max(0, viewport.safeBottom ?? 0)
  const safeLeft = Math.max(0, viewport.safeLeft ?? 0)
  const safeRight = Math.max(0, viewport.safeRight ?? 0)
  const viewportWidth = Math.max(320, viewport.width - safeLeft - safeRight)
  const viewportHeight = Math.max(280, viewport.height - safeTop - safeBottom)
  const landscape = viewportWidth >= 700 && viewportWidth > viewportHeight * 1.15

  if (landscape) {
    const compact = viewportWidth < 900 || viewportHeight < 560
    const mode: PracticeLayoutMode = compact ? 'phone-landscape' : 'tablet-landscape'
    const headerHeight = compact ? 50 : 58
    const outerMargin = compact ? 8 : viewportWidth >= 1200 ? 16 : 12
    const gap = compact ? 10 : viewportWidth >= 1200 ? 18 : 16
    const panelWidth = compact
      ? Math.round(clamp(viewportWidth * 0.23, 168, 216))
      : Math.round(clamp(viewportWidth * 0.245, 240, 340))
    const availableHeight = Math.max(220, viewportHeight - headerHeight - outerMargin * 2)
    const availableWidth = Math.max(220, viewportWidth - outerMargin * 2 - gap - panelWidth)
    return {
      mode,
      canvasSide: Math.floor(Math.min(availableWidth, availableHeight, 960)),
      availableWidth,
      availableHeight,
      viewportWidth,
      viewportHeight,
      headerHeight,
      panelWidth,
      gap,
      outerMargin,
    }
  }

  const horizontalMargin = viewportWidth <= 420 ? 20 : 24
  const headerHeight = viewportHeight <= 680 ? 50 : 58
  const bottomBar = viewportHeight <= 680 ? 50 : 58
  const statusAndMessage = viewportHeight <= 680 ? 54 : 70
  const outerMargin = 6
  const availableWidth = Math.max(160, viewportWidth - horizontalMargin)
  const availableHeight = Math.max(160, viewportHeight - headerHeight - bottomBar - statusAndMessage - outerMargin * 2)
  return {
    mode: 'portrait',
    canvasSide: Math.floor(Math.min(availableWidth, availableHeight, 720)),
    availableWidth,
    availableHeight,
    viewportWidth,
    viewportHeight,
    headerHeight,
    panelWidth: 0,
    gap: 0,
    outerMargin,
  }
}
