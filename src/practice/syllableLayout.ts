import { decomposeHangulCharacter } from './hangulDecompose'
import {
  COMPLEX_VOWEL_COMPONENTS,
  FINAL_CLUSTER_COMPONENTS,
  getSimpleJamoTemplate,
  isVowelJamo,
} from './strokeTemplates'
import {
  adjustAllStrokes,
  adjustStrokeGroup,
  fitStrokesToBox,
  getStrokeBounds,
  prefixStrokeIds,
} from './glyphFit'
import { getOpticalAdjustment } from './opticalAdjustments'
import {
  COMPLEX_BOTTOM_VOWELS,
  COMPLEX_TOP_VOWELS,
  HORIZONTAL_VOWELS,
  VERTICAL_VOWELS,
  getSyllableFinalKind,
  getSyllableLayoutTemplate,
  getSyllableLayoutType,
} from './syllableLayoutTemplates'
import { getSyllableOverride } from './syllableOverrides'
import type { GlyphBounds, GlyphFitMetadata, GeneratedCharacter, StrokePath, SyllableFinalKind, SyllableLayoutType, SyllableRole } from './types'
import type { LayoutBox, SyllableLayoutTemplate } from './syllableLayoutTemplates'

export type { LayoutBox } from './syllableLayoutTemplates'

export interface SyllableLayoutBoxes {
  initial: LayoutBox
  medial: LayoutBox[]
  final?: LayoutBox
  clusterFinal?: [LayoutBox, LayoutBox]
  target: LayoutBox
  minimumGap: number
}

export interface CharacterGenerationOptions {
  applyOptical?: boolean
  applyOverride?: boolean
  applyFit?: boolean
}

export interface CharacterGenerationStages {
  character: GeneratedCharacter
  layoutType?: SyllableLayoutType
  finalKind: SyllableFinalKind
  basePlacedStrokes: StrokePath[]
  opticalPlacedStrokes: StrokePath[]
  overriddenStrokes: StrokePath[]
  beforeFitBounds: GlyphBounds | null
  fitMetadata?: GlyphFitMetadata
  overrideApplied: boolean
}

function placeTemplateInBox(
  template: StrokePath[],
  box: LayoutBox,
  prefix: string,
): StrokePath[] {
  const fitted = fitStrokesToBox(template, box).strokes
  return prefixStrokeIds(fitted, prefix)
}

function placeJamo(
  jamo: string,
  role: SyllableRole,
  box: LayoutBox,
  layoutType: SyllableLayoutType,
  prefix: string,
  applyOptical: boolean,
): StrokePath[] {
  const template = getSimpleJamoTemplate(jamo)
  const placed = placeTemplateInBox(template, box, prefix)
  if (!applyOptical) return placed
  return adjustAllStrokes(placed, getOpticalAdjustment(jamo, role, layoutType))
}

function placeMedial(
  medial: string,
  template: SyllableLayoutTemplate,
  applyOptical: boolean,
): StrokePath[] {
  const layoutType = template.type
  if (VERTICAL_VOWELS.has(medial) || HORIZONTAL_VOWELS.has(medial)) {
    return placeJamo(medial, 'medial', template.medial[0], layoutType, `medial-${medial}-`, applyOptical)
  }
  const components = COMPLEX_VOWEL_COMPONENTS[medial]
  if (!components || template.medial.length < 2) return []
  const [horizontal, vertical] = components
  return [
    ...placeJamo(horizontal, 'medial', template.medial[0], layoutType, `medial-${medial}-h-`, applyOptical),
    ...placeJamo(vertical, 'medial', template.medial[1], layoutType, `medial-${medial}-v-`, applyOptical),
  ]
}

function placeFinal(
  finalJamo: string,
  template: SyllableLayoutTemplate,
  applyOptical: boolean,
): StrokePath[] {
  const cluster = FINAL_CLUSTER_COMPONENTS[finalJamo]
  if (cluster && template.clusterFinal) {
    const [left, right] = cluster
    return [
      ...placeJamo(left, 'final', template.clusterFinal[0], template.type, `final-${finalJamo}-l-`, applyOptical),
      ...placeJamo(right, 'final', template.clusterFinal[1], template.type, `final-${finalJamo}-r-`, applyOptical),
    ]
  }
  if (!template.final) return []
  return placeJamo(finalJamo, 'final', template.final, template.type, `final-${finalJamo}-`, applyOptical)
}

function placeSyllableParts(
  initial: string,
  medial: string,
  final: string | undefined,
  template: SyllableLayoutTemplate,
  applyOptical: boolean,
): StrokePath[] {
  return [
    ...placeJamo(initial, 'initial', template.initial, template.type, `initial-${initial}-`, applyOptical),
    ...placeMedial(medial, template, applyOptical),
    ...(final ? placeFinal(final, template, applyOptical) : []),
  ]
}

function rolePredicate(role: SyllableRole): (stroke: StrokePath) => boolean {
  return (stroke) => stroke.id.startsWith(`${role}-`)
}

function applySyllableOverride(character: string, strokes: StrokePath[]): { strokes: StrokePath[]; applied: boolean } {
  const override = getSyllableOverride(character)
  if (!override) return { strokes, applied: false }
  let adjusted = strokes
  for (const role of ['initial', 'medial', 'final'] as const) {
    adjusted = adjustStrokeGroup(adjusted, rolePredicate(role), override.roles?.[role])
  }
  adjusted = adjustAllStrokes(adjusted, override.whole)
  return { strokes: adjusted, applied: true }
}

function createSyllableStages(
  character: string,
  initial: string,
  medial: string,
  final: string | undefined,
  options: CharacterGenerationOptions,
): CharacterGenerationStages {
  const applyOptical = options.applyOptical ?? true
  const applyOverride = options.applyOverride ?? true
  const applyFit = options.applyFit ?? true
  const template = getSyllableLayoutTemplate(medial, Boolean(final))
  const layoutType = template.type
  const finalKind = getSyllableFinalKind(final, Boolean(final && FINAL_CLUSTER_COMPONENTS[final]))
  const basePlacedStrokes = placeSyllableParts(initial, medial, final, template, false)
  const opticalPlacedStrokes = applyOptical
    ? placeSyllableParts(initial, medial, final, template, true)
    : basePlacedStrokes
  const overrideResult = applyOverride
    ? applySyllableOverride(character, opticalPlacedStrokes)
    : { strokes: opticalPlacedStrokes, applied: false }
  const overriddenStrokes = overrideResult.strokes
  const beforeFitBounds = getStrokeBounds(overriddenStrokes)
  const override = overrideResult.applied ? getSyllableOverride(character) : undefined
  const target = override?.fitBox ?? template.target
  const fitResult = applyFit ? fitStrokesToBox(overriddenStrokes, target) : undefined
  const finalStrokes = fitResult?.strokes ?? overriddenStrokes
  const generated: GeneratedCharacter = {
    character,
    kind: 'syllable',
    initial,
    medial,
    final,
    strokes: finalStrokes,
    layoutType,
    finalKind,
    fit: fitResult?.metadata,
    overrideKey: overrideResult.applied ? character : undefined,
  }
  return {
    character: generated,
    layoutType,
    finalKind,
    basePlacedStrokes,
    opticalPlacedStrokes,
    overriddenStrokes,
    beforeFitBounds,
    fitMetadata: fitResult?.metadata,
    overrideApplied: overrideResult.applied,
  }
}

function createJamoStages(character: string, options: CharacterGenerationOptions): CharacterGenerationStages | null {
  const template = getSimpleJamoTemplate(character)
  if (!template.length) return null
  const isVowel = isVowelJamo(character)
  const baseBox: LayoutBox = isVowel
    ? { x: 0.17, y: 0.11, width: 0.66, height: 0.78 }
    : { x: 0.14, y: 0.13, width: 0.72, height: 0.74 }
  const layoutType: SyllableLayoutType = 'vertical-no-final'
  const role: SyllableRole = isVowel ? 'medial' : 'initial'
  const basePlacedStrokes = placeTemplateInBox(template, baseBox, `jamo-${character}-`)
  const opticalPlacedStrokes = options.applyOptical === false
    ? basePlacedStrokes
    : adjustAllStrokes(basePlacedStrokes, getOpticalAdjustment(character, role, layoutType))
  const beforeFitBounds = getStrokeBounds(opticalPlacedStrokes)
  const fitResult = options.applyFit === false
    ? undefined
    : fitStrokesToBox(opticalPlacedStrokes, { x: 0.14, y: 0.11, width: 0.72, height: 0.78 })
  const generated: GeneratedCharacter = {
    character,
    kind: 'jamo',
    strokes: fitResult?.strokes ?? opticalPlacedStrokes,
    fit: fitResult?.metadata,
  }
  return {
    character: generated,
    finalKind: 'none',
    basePlacedStrokes,
    opticalPlacedStrokes,
    overriddenStrokes: opticalPlacedStrokes,
    beforeFitBounds,
    fitMetadata: fitResult?.metadata,
    overrideApplied: false,
  }
}

export function generateCharacterStrokeStages(
  character: string,
  options: CharacterGenerationOptions = {},
): CharacterGenerationStages | null {
  const decomposition = decomposeHangulCharacter(character)
  if (decomposition.kind === 'unsupported') return null
  if (decomposition.kind === 'jamo') return createJamoStages(character, options)
  return createSyllableStages(
    character,
    decomposition.initial as string,
    decomposition.medial as string,
    decomposition.final,
    options,
  )
}

export function generateCharacterStrokes(character: string): GeneratedCharacter | null {
  return generateCharacterStrokeStages(character)?.character ?? null
}

export function getSyllableLayoutBoxes(medial: string, hasFinal: boolean): SyllableLayoutBoxes {
  const template = getSyllableLayoutTemplate(medial, hasFinal)
  return {
    initial: { ...template.initial },
    medial: template.medial.map((box) => ({ ...box })),
    final: template.final ? { ...template.final } : undefined,
    clusterFinal: template.clusterFinal
      ? [{ ...template.clusterFinal[0] }, { ...template.clusterFinal[1] }]
      : undefined,
    target: { ...template.target },
    minimumGap: template.minimumGap,
  }
}

export function isGeneratedCharacterInBounds(character: GeneratedCharacter): boolean {
  return character.strokes.length > 0 && character.strokes.every((stroke) =>
    stroke.points.length > 0
      && stroke.guidePoints.length > 0
      && [...stroke.points, ...stroke.guidePoints, ...stroke.waypoints, stroke.start, stroke.end].every((point) =>
        Number.isFinite(point.x)
          && Number.isFinite(point.y)
          && point.x >= 0
          && point.x <= 1
          && point.y >= 0
          && point.y <= 1,
      ),
  )
}

export { getStrokeBounds } from './glyphFit'

export function getGeneratedComponentBounds(character: GeneratedCharacter): Partial<Record<SyllableRole, GlyphBounds>> {
  const result: Partial<Record<SyllableRole, GlyphBounds>> = {}
  if (character.kind !== 'syllable') return result
  for (const role of ['initial', 'medial', 'final'] as const) {
    const bounds = getStrokeBounds(character.strokes.filter(rolePredicate(role)))
    if (bounds) result[role] = bounds
  }
  return result
}

export function getVowelLayoutKind(vowel: string): 'vertical' | 'horizontal' | 'complex-top' | 'complex-bottom' | 'complex-eui' {
  if (VERTICAL_VOWELS.has(vowel)) return 'vertical'
  if (HORIZONTAL_VOWELS.has(vowel)) return 'horizontal'
  if (COMPLEX_TOP_VOWELS.has(vowel)) return 'complex-top'
  if (COMPLEX_BOTTOM_VOWELS.has(vowel)) return 'complex-bottom'
  return 'complex-eui'
}

export { getSyllableLayoutType }
