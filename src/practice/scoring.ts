import { buildPracticeFeedback } from './feedback'
import type { PracticeScore, PracticeScoreMetrics, PracticeStroke } from './types'

export const SCORE_CONFIG = {
  analysisSize: 512,
  paddingRatio: 0.12,
  toleranceRadius: 16,
  userLineWidth: 22,
  referenceStrokeWidth: 10,
  weights: { shape: 50, sizePosition: 20, completion: 20, stability: 10 },
  excessiveAreaStart: 2.8,
  excessiveAreaMaxPenalty: 24,
  minimumPathPoints: 5,
} as const

type Bounds = { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number; centerX: number; centerY: number }

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function createCanvas(size = SCORE_CONFIG.analysisSize) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return canvas
}

function fitFontSize(context: CanvasRenderingContext2D, text: string, size: number) {
  const maxWidth = size * (1 - SCORE_CONFIG.paddingRatio * 2)
  const maxHeight = size * (1 - SCORE_CONFIG.paddingRatio * 2)
  let fontSize = size * (text.length > 1 ? 0.52 : 0.72)
  for (let i = 0; i < 16; i += 1) {
    context.font = `800 ${fontSize}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`
    const metrics = context.measureText(text)
    const measuredHeight = (metrics.actualBoundingBoxAscent || fontSize * 0.8) + (metrics.actualBoundingBoxDescent || fontSize * 0.2)
    if (metrics.width <= maxWidth && measuredHeight <= maxHeight) break
    fontSize *= 0.9
  }
  return fontSize
}

function renderReferenceMask(text: string) {
  const size = SCORE_CONFIG.analysisSize
  const canvas = createCanvas(size)
  const context = canvas.getContext('2d', { willReadFrequently: true })!
  context.clearRect(0, 0, size, size)
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  const fontSize = fitFontSize(context, text, size)
  context.font = `800 ${fontSize}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`
  context.fillStyle = '#000'
  context.strokeStyle = '#000'
  context.lineJoin = 'round'
  context.lineWidth = SCORE_CONFIG.referenceStrokeWidth
  context.fillText(text, size / 2, size / 2)
  context.strokeText(text, size / 2, size / 2)
  return alphaMask(context.getImageData(0, 0, size, size))
}

function renderUserMask(strokes: PracticeStroke[]) {
  const size = SCORE_CONFIG.analysisSize
  const canvas = createCanvas(size)
  const context = canvas.getContext('2d', { willReadFrequently: true })!
  context.clearRect(0, 0, size, size)
  context.strokeStyle = '#000'
  context.fillStyle = '#000'
  context.lineCap = 'round'
  context.lineJoin = 'round'

  strokes.forEach((stroke) => {
    if (stroke.points.length === 0) return
    if (stroke.points.length === 1) {
      const point = stroke.points[0]
      const radius = SCORE_CONFIG.userLineWidth * (0.7 + point.pressure * 0.5) / 2
      context.beginPath()
      context.arc(point.x * size, point.y * size, radius, 0, Math.PI * 2)
      context.fill()
      return
    }

    for (let index = 1; index < stroke.points.length; index += 1) {
      const previous = stroke.points[index - 1]
      const point = stroke.points[index]
      const pressure = (previous.pressure + point.pressure) / 2
      context.lineWidth = SCORE_CONFIG.userLineWidth * (0.78 + pressure * 0.5)
      context.beginPath()
      context.moveTo(previous.x * size, previous.y * size)
      context.lineTo(point.x * size, point.y * size)
      context.stroke()
    }
  })
  return alphaMask(context.getImageData(0, 0, size, size))
}

function alphaMask(imageData: ImageData) {
  const mask = new Uint8Array(imageData.width * imageData.height)
  for (let index = 0; index < mask.length; index += 1) {
    mask[index] = imageData.data[index * 4 + 3] > 24 ? 1 : 0
  }
  return mask
}

function dilate(mask: Uint8Array, radius: number) {
  const size = SCORE_CONFIG.analysisSize
  const horizontal = new Uint8Array(mask.length)
  const output = new Uint8Array(mask.length)

  // 슬라이딩 윈도우로 가로·세로 허용 영역을 확장합니다.
  // 512×512 마스크에서 반경이 커져도 픽셀 수에 비례해 처리되어
  // 모바일 브라우저의 채점 지연을 줄입니다.
  for (let y = 0; y < size; y += 1) {
    const row = y * size
    let active = 0
    for (let x = 0; x <= Math.min(size - 1, radius); x += 1) active += mask[row + x]
    for (let x = 0; x < size; x += 1) {
      horizontal[row + x] = active > 0 ? 1 : 0
      const removeX = x - radius
      const addX = x + radius + 1
      if (removeX >= 0) active -= mask[row + removeX]
      if (addX < size) active += mask[row + addX]
    }
  }

  for (let x = 0; x < size; x += 1) {
    let active = 0
    for (let y = 0; y <= Math.min(size - 1, radius); y += 1) active += horizontal[y * size + x]
    for (let y = 0; y < size; y += 1) {
      output[y * size + x] = active > 0 ? 1 : 0
      const removeY = y - radius
      const addY = y + radius + 1
      if (removeY >= 0) active -= horizontal[removeY * size + x]
      if (addY < size) active += horizontal[addY * size + x]
    }
  }
  return output
}

function count(mask: Uint8Array) {
  let total = 0
  for (const value of mask) total += value
  return total
}

function overlapCount(a: Uint8Array, b: Uint8Array) {
  let total = 0
  for (let index = 0; index < a.length; index += 1) if (a[index] && b[index]) total += 1
  return total
}

function getBounds(mask: Uint8Array): Bounds | null {
  const size = SCORE_CONFIG.analysisSize
  let minX: number = size
  let minY: number = size
  let maxX: number = -1
  let maxY: number = -1
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!mask[y * size + x]) continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  if (maxX < 0) return null
  const width = maxX - minX + 1
  const height = maxY - minY + 1
  return { minX, minY, maxX, maxY, width, height, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 }
}

function calculateJitter(strokes: PracticeStroke[]) {
  let directionChanges = 0
  let samples = 0
  for (const stroke of strokes) {
    for (let index = 2; index < stroke.points.length; index += 1) {
      const a = stroke.points[index - 2]
      const b = stroke.points[index - 1]
      const c = stroke.points[index]
      const firstAngle = Math.atan2(b.y - a.y, b.x - a.x)
      const secondAngle = Math.atan2(c.y - b.y, c.x - b.x)
      let delta = Math.abs(secondAngle - firstAngle)
      if (delta > Math.PI) delta = Math.PI * 2 - delta
      if (delta > 1.15) directionChanges += clamp((delta - 1.15) / 1.5)
      samples += 1
    }
  }
  return samples === 0 ? 0.7 : clamp(directionChanges / Math.max(1, samples * 0.35))
}

/**
 * 픽셀 비교 결과를 100점 척도로 합성합니다. DOM/Canvas 없이도 테스트할 수 있도록
 * 분리했으며, 전체 칠하기와 한두 점 입력은 여기서 최종 감점합니다.
 */
export function calculateScoreFromMetrics(metrics: PracticeScoreMetrics): PracticeScore {
  const centerDistance = Math.hypot(metrics.centerOffsetX, metrics.centerOffsetY)
  const sizeSimilarity = clamp(1 - Math.abs(Math.log(Math.max(0.05, metrics.sizeRatio))) / Math.log(2.2))
  const centerSimilarity = clamp(1 - centerDistance / 0.28)
  const shape = SCORE_CONFIG.weights.shape * clamp(metrics.f1 * 1.08)
  const sizePosition = SCORE_CONFIG.weights.sizePosition * (centerSimilarity * 0.58 + sizeSimilarity * 0.42)
  const shortInputFactor = clamp(metrics.pointCount / SCORE_CONFIG.minimumPathPoints)
  const completion = SCORE_CONFIG.weights.completion
    * clamp(metrics.coverage * 0.82 + metrics.precision * 0.18)
    * shortInputFactor
  const stability = SCORE_CONFIG.weights.stability * clamp(1 - metrics.jitter * 0.8)

  const excessiveRatio = clamp((metrics.userAreaRatio - SCORE_CONFIG.excessiveAreaStart) / 4)
  const overpaintPenalty = excessiveRatio * SCORE_CONFIG.excessiveAreaMaxPenalty
    + clamp((0.48 - metrics.precision) / 0.48) * 10
  const total = Math.round(clamp(shape + sizePosition + completion + stability - overpaintPenalty, 0, 100))

  return {
    total,
    shape: Math.round(shape),
    sizePosition: Math.round(sizePosition),
    completion: Math.round(completion),
    stability: Math.round(stability),
    metrics,
    feedback: buildPracticeFeedback(total, metrics),
  }
}

/**
 * 브라우저 안에서 기준 글자 마스크와 사용자 획 마스크를 비교합니다.
 * - 모양 50: 허용 영역 정확도와 기준 글자 커버리지의 조화평균(F1)
 * - 크기/위치 20: 중심 오차와 바운딩 박스 크기 비율
 * - 완성도 20: 기준 커버리지 중심, 지나치게 짧은 입력 감점
 * - 선 안정성 10: 연속 좌표의 급격한 방향 전환 비율
 * 전체 칠하기는 사용자 면적·정확도 패널티를 적용합니다.
 */
export function scorePractice(text: string, strokes: PracticeStroke[]): PracticeScore | null {
  const pointCount = strokes.reduce((total, stroke) => total + stroke.points.length, 0)
  if (pointCount === 0) return null

  const reference = renderReferenceMask(text)
  const user = renderUserMask(strokes)
  const referenceExpanded = dilate(reference, SCORE_CONFIG.toleranceRadius)
  const userExpanded = dilate(user, SCORE_CONFIG.toleranceRadius)
  const referencePixels = Math.max(1, count(reference))
  const userPixels = Math.max(1, count(user))
  const precision = overlapCount(user, referenceExpanded) / userPixels
  const coverage = overlapCount(reference, userExpanded) / referencePixels
  const f1 = precision + coverage > 0 ? 2 * precision * coverage / (precision + coverage) : 0

  const referenceBounds = getBounds(reference)!
  const userBounds = getBounds(user)!
  const size = SCORE_CONFIG.analysisSize
  const centerOffsetX = (userBounds.centerX - referenceBounds.centerX) / size
  const centerOffsetY = (userBounds.centerY - referenceBounds.centerY) / size
  const referenceDiagonal = Math.hypot(referenceBounds.width, referenceBounds.height)
  const userDiagonal = Math.hypot(userBounds.width, userBounds.height)
  const sizeRatio = userDiagonal / Math.max(1, referenceDiagonal)
  const userAreaRatio = userPixels / referencePixels
  const jitter = calculateJitter(strokes)

  const metrics: PracticeScoreMetrics = {
    precision,
    coverage,
    f1,
    centerOffsetX,
    centerOffsetY,
    sizeRatio,
    userAreaRatio,
    jitter,
    strokeCount: strokes.length,
    pointCount,
  }

  return calculateScoreFromMetrics(metrics)
}
