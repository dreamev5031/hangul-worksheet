import type { PracticePoint, StrokePath } from './types'

export interface RectTransform {
  x: number
  y: number
  width: number
  height: number
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function transformPoint(point: PracticePoint, transform: RectTransform): PracticePoint {
  return {
    ...point,
    x: clamp01(transform.x + point.x * transform.width),
    y: clamp01(transform.y + point.y * transform.height),
  }
}

function getStrokeTransform(stroke: StrokePath, transform: RectTransform): RectTransform {
  if (!stroke.preserveAspect) return transform
  const size = Math.min(transform.width, transform.height)
  return {
    x: transform.x + (transform.width - size) / 2,
    y: transform.y + (transform.height - size) / 2,
    width: size,
    height: size,
  }
}

export function transformStroke(stroke: StrokePath, transform: RectTransform, idPrefix = ''): StrokePath {
  const effectiveTransform = getStrokeTransform(stroke, transform)
  const points = stroke.points.map((point) => transformPoint(point, effectiveTransform))
  const directionTarget = stroke.closed && points.length > 2 ? points[Math.max(1, Math.floor(points.length * 0.2))] : points[points.length - 1]
  const dx = directionTarget.x - points[0].x
  const dy = directionTarget.y - points[0].y
  const magnitude = Math.hypot(dx, dy) || 1
  const guidePoints = stroke.guidePoints.map((point) => transformPoint(point, effectiveTransform))
  const waypoints = stroke.waypoints.map((point) => transformPoint(point, effectiveTransform))
  return {
    ...stroke,
    id: `${idPrefix}${stroke.id}`,
    points,
    guidePoints,
    waypoints,
    start: points[0],
    end: points[points.length - 1],
    direction: { dx: dx / magnitude, dy: dy / magnitude },
    thickness: stroke.thickness * Math.min(effectiveTransform.width, effectiveTransform.height),
    tolerance: stroke.tolerance * Math.max(effectiveTransform.width, effectiveTransform.height),
  }
}

export function distance(a: PracticePoint, b: PracticePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function polylineLength(points: PracticePoint[]): number {
  let total = 0
  for (let index = 1; index < points.length; index += 1) total += distance(points[index - 1], points[index])
  return total
}

export function resamplePolyline(points: PracticePoint[], sampleCount: number): PracticePoint[] {
  if (!points.length || sampleCount <= 0) return []
  if (points.length === 1 || sampleCount === 1) return [{ ...points[0] }]
  const lengths: number[] = [0]
  for (let index = 1; index < points.length; index += 1) {
    lengths.push(lengths[index - 1] + distance(points[index - 1], points[index]))
  }
  const total = lengths[lengths.length - 1]
  if (total <= Number.EPSILON) return Array.from({ length: sampleCount }, () => ({ ...points[0] }))
  const result: PracticePoint[] = []
  let segment = 1
  for (let sample = 0; sample < sampleCount; sample += 1) {
    const target = (sample / (sampleCount - 1)) * total
    while (segment < lengths.length - 1 && lengths[segment] < target) segment += 1
    const previousIndex = Math.max(0, segment - 1)
    const span = lengths[segment] - lengths[previousIndex]
    const ratio = span <= Number.EPSILON ? 0 : (target - lengths[previousIndex]) / span
    const previous = points[previousIndex]
    const next = points[segment]
    result.push({
      x: previous.x + (next.x - previous.x) * ratio,
      y: previous.y + (next.y - previous.y) * ratio,
      pressure: previous.pressure ?? next.pressure,
      time: previous.time === undefined || next.time === undefined
        ? previous.time ?? next.time
        : previous.time + (next.time - previous.time) * ratio,
    })
  }
  return result
}

export function pointToSegmentDistance(point: PracticePoint, start: PracticePoint, end: PracticePoint): number {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared <= Number.EPSILON) return distance(point, start)
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared))
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy))
}

export function pointToPolylineDistance(point: PracticePoint, polyline: PracticePoint[]): number {
  if (!polyline.length) return Number.POSITIVE_INFINITY
  if (polyline.length === 1) return distance(point, polyline[0])
  let minimum = Number.POSITIVE_INFINITY
  for (let index = 1; index < polyline.length; index += 1) {
    minimum = Math.min(minimum, pointToSegmentDistance(point, polyline[index - 1], polyline[index]))
  }
  return minimum
}

export function boundingArea(points: PracticePoint[]): number {
  if (!points.length) return 0
  let minX = 1
  let maxX = 0
  let minY = 1
  let maxY = 0
  points.forEach((point) => {
    minX = Math.min(minX, point.x)
    maxX = Math.max(maxX, point.x)
    minY = Math.min(minY, point.y)
    maxY = Math.max(maxY, point.y)
  })
  return Math.max(0, maxX - minX) * Math.max(0, maxY - minY)
}

export function cosineSimilarity(aStart: PracticePoint, aEnd: PracticePoint, bStart: PracticePoint, bEnd: PracticePoint): number {
  const ax = aEnd.x - aStart.x
  const ay = aEnd.y - aStart.y
  const bx = bEnd.x - bStart.x
  const by = bEnd.y - bStart.y
  const denominator = Math.hypot(ax, ay) * Math.hypot(bx, by)
  if (denominator <= Number.EPSILON) return 0
  return (ax * bx + ay * by) / denominator
}

export function pointAtProgress(points: PracticePoint[], progress: number): PracticePoint {
  const sampled = resamplePolyline(points, 101)
  if (!sampled.length) return { x: 0.5, y: 0.5 }
  return sampled[Math.round(clamp01(progress) * (sampled.length - 1))]
}
