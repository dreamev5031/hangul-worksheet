import { transformStrokeGeometry } from './strokePath'
import type { GlyphBounds, GlyphFitMetadata, StrokePath } from './types'

export interface GlyphTargetBox {
  x: number
  y: number
  width: number
  height: number
}

export interface GeometryAdjustment {
  scaleX?: number
  scaleY?: number
  translateX?: number
  translateY?: number
  strokeWidthScale?: number
}

function boundsFromEdges(x: number, y: number, right: number, bottom: number): GlyphBounds {
  const width = Math.max(0, right - x)
  const height = Math.max(0, bottom - y)
  return {
    x,
    y,
    width,
    height,
    right,
    bottom,
    centerX: x + width / 2,
    centerY: y + height / 2,
  }
}

export function targetBoxToBounds(target: GlyphTargetBox): GlyphBounds {
  return boundsFromEdges(target.x, target.y, target.x + target.width, target.y + target.height)
}

export function getStrokeBounds(strokes: StrokePath[]): GlyphBounds | null {
  const points = strokes.flatMap((stroke) => stroke.guidePoints)
  if (!points.length) return null
  const minX = Math.min(...points.map((point) => point.x))
  const maxX = Math.max(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const maxY = Math.max(...points.map((point) => point.y))
  return boundsFromEdges(minX, minY, maxX, maxY)
}

export function prefixStrokeIds(strokes: StrokePath[], prefix: string): StrokePath[] {
  return strokes.map((stroke, index) => ({ ...stroke, id: `${prefix}${index + 1}-${stroke.id}` }))
}

export function multiplyStrokeWidth(strokes: StrokePath[], scale: number): StrokePath[] {
  if (Math.abs(scale - 1) <= Number.EPSILON) return strokes
  return strokes.map((stroke) => ({ ...stroke, thickness: stroke.thickness * scale }))
}

export function adjustStrokeGroup(
  strokes: StrokePath[],
  predicate: (stroke: StrokePath) => boolean,
  adjustment: GeometryAdjustment | undefined,
): StrokePath[] {
  if (!adjustment) return strokes
  const selected = strokes.filter(predicate)
  const bounds = getStrokeBounds(selected)
  if (!bounds) return strokes
  const scaleX = adjustment.scaleX ?? 1
  const scaleY = adjustment.scaleY ?? 1
  const translateX = adjustment.translateX ?? 0
  const translateY = adjustment.translateY ?? 0
  const strokeWidthScale = adjustment.strokeWidthScale
  return strokes.map((stroke) => {
    if (!predicate(stroke)) return stroke
    return transformStrokeGeometry(stroke, {
      originX: bounds.centerX,
      originY: bounds.centerY,
      scaleX,
      scaleY,
      translateX,
      translateY,
      thicknessScale: strokeWidthScale ?? Math.min(Math.abs(scaleX), Math.abs(scaleY)),
      toleranceScale: Math.max(Math.abs(scaleX), Math.abs(scaleY)),
      clamp: false,
    })
  })
}

export function adjustAllStrokes(strokes: StrokePath[], adjustment: GeometryAdjustment | undefined): StrokePath[] {
  return adjustStrokeGroup(strokes, () => true, adjustment)
}

export function fitStrokesToBox(
  strokes: StrokePath[],
  target: GlyphTargetBox,
): { strokes: StrokePath[]; metadata: GlyphFitMetadata } {
  const before = getStrokeBounds(strokes)
  if (!before) {
    const targetBounds = targetBoxToBounds(target)
    return {
      strokes,
      metadata: {
        before: targetBounds,
        after: targetBounds,
        target: targetBounds,
        scale: 1,
        translateX: 0,
        translateY: 0,
        usageX: 0,
        usageY: 0,
      },
    }
  }

  const safeWidth = Math.max(before.width, 0.025)
  const safeHeight = Math.max(before.height, 0.025)
  const scale = Math.min(target.width / safeWidth, target.height / safeHeight)
  const targetCenterX = target.x + target.width / 2
  const targetCenterY = target.y + target.height / 2
  const translateX = targetCenterX - before.centerX
  const translateY = targetCenterY - before.centerY
  const fitted = strokes.map((stroke) => transformStrokeGeometry(stroke, {
    originX: before.centerX,
    originY: before.centerY,
    scaleX: scale,
    scaleY: scale,
    translateX,
    translateY,
    thicknessScale: scale,
    toleranceScale: scale,
    clamp: true,
  }))
  const after = getStrokeBounds(fitted) ?? before
  const targetBounds = targetBoxToBounds(target)
  return {
    strokes: fitted,
    metadata: {
      before,
      after,
      target: targetBounds,
      scale,
      translateX,
      translateY,
      usageX: target.width > 0 ? after.width / target.width : 0,
      usageY: target.height > 0 ? after.height / target.height : 0,
    },
  }
}

export function isGlyphInUnitBounds(bounds: GlyphBounds | null): boolean {
  return Boolean(bounds)
    && Number.isFinite(bounds?.x)
    && Number.isFinite(bounds?.y)
    && Number.isFinite(bounds?.right)
    && Number.isFinite(bounds?.bottom)
    && (bounds?.x ?? -1) >= 0
    && (bounds?.y ?? -1) >= 0
    && (bounds?.right ?? 2) <= 1
    && (bounds?.bottom ?? 2) <= 1
}

export function getGlyphCenterOffset(bounds: GlyphBounds): number {
  return Math.hypot(bounds.centerX - 0.5, bounds.centerY - 0.5)
}
