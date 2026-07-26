import { getStrokeBounds } from './glyphFit'
import type { GeneratedCharacter, GlyphBounds, StrokePath, SyllableRole } from './types'

export interface GlyphQualityMetrics {
  bounds: GlyphBounds
  centerOffset: number
  aspectRatio: number
  usageX: number
  usageY: number
  roleBounds: Partial<Record<SyllableRole, GlyphBounds>>
  upperBounds?: GlyphBounds
  finalToInitialWidth?: number
  finalToInitialHeight?: number
  finalToUpperWidth?: number
  finalToUpperHeight?: number
  upperToFinalGap?: number
  closedStrokeRatios: number[]
}

function roleStrokes(character: GeneratedCharacter, role: SyllableRole): StrokePath[] {
  return character.strokes.filter((stroke) => stroke.id.startsWith(`${role}-`))
}

export function getGlyphQualityMetrics(character: GeneratedCharacter): GlyphQualityMetrics | null {
  const bounds = getStrokeBounds(character.strokes)
  if (!bounds) return null
  const roleGroups: Record<SyllableRole, StrokePath[]> = {
    initial: roleStrokes(character, 'initial'),
    medial: roleStrokes(character, 'medial'),
    final: roleStrokes(character, 'final'),
  }
  const roleBounds: Partial<Record<SyllableRole, GlyphBounds>> = {}
  for (const role of ['initial', 'medial', 'final'] as const) {
    const roleBoundsValue = getStrokeBounds(roleGroups[role])
    if (roleBoundsValue) roleBounds[role] = roleBoundsValue
  }
  const initial = roleBounds.initial
  const medial = roleBounds.medial
  const final = roleBounds.final
  const upperBounds = getStrokeBounds([...roleGroups.initial, ...roleGroups.medial]) ?? undefined
  const upperBottom = upperBounds?.bottom
  const target = character.fit?.target
  const closedStrokeRatios = character.strokes
    .filter((stroke) => stroke.closed)
    .map((stroke) => getStrokeBounds([stroke]))
    .filter((value): value is GlyphBounds => Boolean(value))
    .map((value) => value.height > 0 ? value.width / value.height : Number.POSITIVE_INFINITY)
  return {
    bounds,
    centerOffset: Math.hypot(bounds.centerX - 0.5, bounds.centerY - 0.5),
    aspectRatio: bounds.height > 0 ? bounds.width / bounds.height : Number.POSITIVE_INFINITY,
    usageX: target && target.width > 0 ? bounds.width / target.width : 0,
    usageY: target && target.height > 0 ? bounds.height / target.height : 0,
    roleBounds,
    upperBounds,
    finalToInitialWidth: initial && final && initial.width > 0 ? final.width / initial.width : undefined,
    finalToInitialHeight: initial && final && initial.height > 0 ? final.height / initial.height : undefined,
    finalToUpperWidth: upperBounds && final && upperBounds.width > 0 ? final.width / upperBounds.width : undefined,
    finalToUpperHeight: upperBounds && final && upperBounds.height > 0 ? final.height / upperBounds.height : undefined,
    upperToFinalGap: final && upperBottom !== undefined ? final.y - upperBottom : undefined,
    closedStrokeRatios,
  }
}
