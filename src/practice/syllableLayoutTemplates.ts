import type { SyllableFinalKind, SyllableLayoutType } from './types'
import type { GlyphTargetBox } from './glyphFit'

export interface LayoutBox {
  x: number
  y: number
  width: number
  height: number
}

export interface SyllableLayoutTemplate {
  type: SyllableLayoutType
  initial: LayoutBox
  medial: LayoutBox[]
  final?: LayoutBox
  clusterFinal?: [LayoutBox, LayoutBox]
  minimumGap: number
  target: GlyphTargetBox
}

export const VERTICAL_VOWELS = new Set(['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅣ'])
export const HORIZONTAL_VOWELS = new Set(['ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ'])
export const COMPLEX_TOP_VOWELS = new Set(['ㅘ', 'ㅙ', 'ㅚ'])
export const COMPLEX_BOTTOM_VOWELS = new Set(['ㅝ', 'ㅞ', 'ㅟ'])

const BASE_TEMPLATES: Record<SyllableLayoutType, SyllableLayoutTemplate> = {
  'vertical-no-final': {
    type: 'vertical-no-final',
    initial: { x: 0.13, y: 0.13, width: 0.31, height: 0.7 },
    medial: [{ x: 0.5, y: 0.11, width: 0.28, height: 0.74 }],
    minimumGap: 0.055,
    target: { x: 0.12, y: 0.1, width: 0.76, height: 0.8 },
  },
  'vertical-with-final': {
    type: 'vertical-with-final',
    initial: { x: 0.14, y: 0.09, width: 0.3, height: 0.47 },
    medial: [{ x: 0.5, y: 0.08, width: 0.27, height: 0.49 }],
    final: { x: 0.27, y: 0.65, width: 0.46, height: 0.27 },
    clusterFinal: [
      { x: 0.24, y: 0.67, width: 0.24, height: 0.24 },
      { x: 0.52, y: 0.67, width: 0.24, height: 0.24 },
    ],
    minimumGap: 0.055,
    target: { x: 0.12, y: 0.08, width: 0.76, height: 0.84 },
  },
  'horizontal-no-final': {
    type: 'horizontal-no-final',
    initial: { x: 0.19, y: 0.11, width: 0.62, height: 0.32 },
    medial: [{ x: 0.13, y: 0.47, width: 0.74, height: 0.26 }],
    minimumGap: 0.045,
    target: { x: 0.13, y: 0.11, width: 0.74, height: 0.78 },
  },
  'horizontal-with-final': {
    type: 'horizontal-with-final',
    initial: { x: 0.2, y: 0.07, width: 0.6, height: 0.27 },
    medial: [{ x: 0.13, y: 0.36, width: 0.74, height: 0.2 }],
    final: { x: 0.27, y: 0.65, width: 0.46, height: 0.27 },
    clusterFinal: [
      { x: 0.24, y: 0.67, width: 0.24, height: 0.24 },
      { x: 0.52, y: 0.67, width: 0.24, height: 0.24 },
    ],
    minimumGap: 0.05,
    target: { x: 0.13, y: 0.08, width: 0.74, height: 0.84 },
  },
  'compound-no-final': {
    type: 'compound-no-final',
    initial: { x: 0.13, y: 0.09, width: 0.32, height: 0.36 },
    medial: [
      { x: 0.13, y: 0.38, width: 0.7, height: 0.25 },
      { x: 0.48, y: 0.08, width: 0.3, height: 0.5 },
    ],
    minimumGap: 0.035,
    target: { x: 0.12, y: 0.09, width: 0.76, height: 0.82 },
  },
  'compound-with-final': {
    type: 'compound-with-final',
    initial: { x: 0.14, y: 0.07, width: 0.3, height: 0.31 },
    medial: [
      { x: 0.13, y: 0.38, width: 0.7, height: 0.2 },
      { x: 0.48, y: 0.07, width: 0.29, height: 0.4 },
    ],
    final: { x: 0.27, y: 0.66, width: 0.46, height: 0.25 },
    clusterFinal: [
      { x: 0.24, y: 0.68, width: 0.24, height: 0.22 },
      { x: 0.52, y: 0.68, width: 0.24, height: 0.22 },
    ],
    minimumGap: 0.05,
    target: { x: 0.13, y: 0.07, width: 0.74, height: 0.86 },
  },
}

function copyBox(box: LayoutBox): LayoutBox {
  return { ...box }
}

function copyTemplate(template: SyllableLayoutTemplate): SyllableLayoutTemplate {
  return {
    ...template,
    initial: copyBox(template.initial),
    medial: template.medial.map(copyBox),
    final: template.final ? copyBox(template.final) : undefined,
    clusterFinal: template.clusterFinal
      ? [copyBox(template.clusterFinal[0]), copyBox(template.clusterFinal[1])]
      : undefined,
    target: { ...template.target },
  }
}

export function getSyllableLayoutType(medial: string, hasFinal: boolean): SyllableLayoutType {
  if (VERTICAL_VOWELS.has(medial)) return hasFinal ? 'vertical-with-final' : 'vertical-no-final'
  if (HORIZONTAL_VOWELS.has(medial)) return hasFinal ? 'horizontal-with-final' : 'horizontal-no-final'
  return hasFinal ? 'compound-with-final' : 'compound-no-final'
}

export function getSyllableFinalKind(finalJamo?: string, isCluster = false): SyllableFinalKind {
  if (!finalJamo) return 'none'
  return isCluster ? 'cluster' : 'single'
}

export function getSyllableLayoutTemplate(
  medial: string,
  hasFinal: boolean,
): SyllableLayoutTemplate {
  const type = getSyllableLayoutType(medial, hasFinal)
  const template = copyTemplate(BASE_TEMPLATES[type])

  if (type.startsWith('compound')) {
    if (COMPLEX_BOTTOM_VOWELS.has(medial)) {
      template.medial[0] = hasFinal
        ? { x: 0.13, y: 0.29, width: 0.7, height: 0.24 }
        : { x: 0.13, y: 0.31, width: 0.7, height: 0.3 }
      template.medial[1] = hasFinal
        ? { x: 0.48, y: 0.07, width: 0.29, height: 0.42 }
        : { x: 0.48, y: 0.08, width: 0.3, height: 0.52 }
    } else if (medial === 'ㅢ') {
      template.medial[0] = hasFinal
        ? { x: 0.14, y: 0.39, width: 0.62, height: 0.18 }
        : { x: 0.14, y: 0.47, width: 0.64, height: 0.23 }
      template.medial[1] = hasFinal
        ? { x: 0.69, y: 0.08, width: 0.15, height: 0.48 }
        : { x: 0.69, y: 0.1, width: 0.16, height: 0.62 }
    }
  }

  return template
}

export function getAllBaseLayoutTemplates(): SyllableLayoutTemplate[] {
  return Object.values(BASE_TEMPLATES).map(copyTemplate)
}
