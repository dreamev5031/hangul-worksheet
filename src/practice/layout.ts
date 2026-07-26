export interface PracticeViewport {
  width: number
  height: number
  safeTop?: number
  safeBottom?: number
  safeLeft?: number
  safeRight?: number
}

export interface PracticeLayoutMetrics {
  canvasSide: number
  availableWidth: number
  availableHeight: number
}

export function calculatePracticeLayout(viewport: PracticeViewport): PracticeLayoutMetrics {
  const safeTop = Math.max(0, viewport.safeTop ?? 0)
  const safeBottom = Math.max(0, viewport.safeBottom ?? 0)
  const safeLeft = Math.max(0, viewport.safeLeft ?? 0)
  const safeRight = Math.max(0, viewport.safeRight ?? 0)
  const horizontalMargin = viewport.width <= 420 ? 20 : 24
  const topBar = viewport.height <= 680 ? 50 : 58
  const bottomBar = viewport.height <= 680 ? 50 : 58
  const statusAndMessage = viewport.height <= 680 ? 54 : 70
  const verticalMargin = 12
  const availableWidth = Math.max(160, viewport.width - safeLeft - safeRight - horizontalMargin)
  const availableHeight = Math.max(160, viewport.height - safeTop - safeBottom - topBar - bottomBar - statusAndMessage - verticalMargin)
  return {
    canvasSide: Math.floor(Math.min(availableWidth, availableHeight, 720)),
    availableWidth,
    availableHeight,
  }
}
