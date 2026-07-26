import { decomposeHangulCharacter } from './hangulDecompose'
import { COMPLEX_VOWEL_COMPONENTS, FINAL_CLUSTER_COMPONENTS, getSimpleJamoTemplate, isVowelJamo } from './strokeTemplates'
import { transformStroke } from './strokePath'
import type { GeneratedCharacter, PracticePoint, StrokePath } from './types'

const VERTICAL_VOWELS = new Set(['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅣ'])
const HORIZONTAL_VOWELS = new Set(['ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ'])
const COMPLEX_TOP_VOWELS = new Set(['ㅘ', 'ㅙ', 'ㅚ'])
const COMPLEX_BOTTOM_VOWELS = new Set(['ㅝ', 'ㅞ', 'ㅟ'])

export interface LayoutBox { x: number; y: number; width: number; height: number }

export interface SyllableLayoutBoxes {
  initial: LayoutBox
  medial: LayoutBox[]
  final?: LayoutBox
}

function place(strokes: StrokePath[], box: LayoutBox, prefix: string): StrokePath[] {
  return strokes.map((stroke, index) => transformStroke(stroke, box, `${prefix}${index + 1}-`))
}

function placeFinal(finalJamo: string, box: LayoutBox): StrokePath[] {
  const cluster = FINAL_CLUSTER_COMPONENTS[finalJamo]
  if (!cluster) return place(getSimpleJamoTemplate(finalJamo), box, `final-${finalJamo}-`)
  const [left, right] = cluster
  const gap = 0.025
  const half = (box.width - gap) / 2
  return [
    ...place(getSimpleJamoTemplate(left), { x: box.x, y: box.y, width: half, height: box.height }, `final-${finalJamo}-l-`),
    ...place(getSimpleJamoTemplate(right), { x: box.x + half + gap, y: box.y, width: half, height: box.height }, `final-${finalJamo}-r-`),
  ]
}

export function getSyllableLayoutBoxes(medial: string, hasFinal: boolean): SyllableLayoutBoxes {
  if (VERTICAL_VOWELS.has(medial)) {
    return hasFinal
      ? {
          initial: { x: 0.08, y: 0.07, width: 0.42, height: 0.54 },
          medial: [{ x: 0.52, y: 0.06, width: 0.4, height: 0.56 }],
          final: { x: 0.3, y: 0.72, width: 0.4, height: 0.22 },
        }
      : {
          initial: { x: 0.06, y: 0.08, width: 0.44, height: 0.84 },
          medial: [{ x: 0.49, y: 0.07, width: 0.44, height: 0.86 }],
        }
  }

  if (HORIZONTAL_VOWELS.has(medial)) {
    return hasFinal
      ? {
          initial: { x: 0.17, y: 0.05, width: 0.66, height: 0.3 },
          medial: [{ x: 0.1, y: 0.39, width: 0.8, height: 0.25 }],
          final: { x: 0.3, y: 0.73, width: 0.4, height: 0.19 },
        }
      : {
          initial: { x: 0.13, y: 0.06, width: 0.74, height: 0.42 },
          medial: [{ x: 0.08, y: 0.52, width: 0.84, height: 0.35 }],
        }
  }

  if (medial === 'ㅢ') {
    return hasFinal
      ? {
          initial: { x: 0.12, y: 0.04, width: 0.4, height: 0.28 },
          medial: [
            { x: 0.1, y: 0.38, width: 0.64, height: 0.2 },
            { x: 0.74, y: 0.05, width: 0.18, height: 0.52 },
          ],
          final: { x: 0.3, y: 0.74, width: 0.4, height: 0.18 },
        }
      : {
          initial: { x: 0.1, y: 0.06, width: 0.44, height: 0.4 },
          medial: [
            { x: 0.08, y: 0.52, width: 0.7, height: 0.26 },
            { x: 0.72, y: 0.08, width: 0.2, height: 0.7 },
          ],
        }
  }

  const isTop = COMPLEX_TOP_VOWELS.has(medial)
  return hasFinal
    ? {
        initial: { x: 0.08, y: 0.05, width: 0.4, height: 0.32 },
        medial: isTop
          ? [
              { x: 0.08, y: 0.39, width: 0.84, height: 0.22 },
              { x: 0.54, y: 0.05, width: 0.38, height: 0.4 },
            ]
          : [
              { x: 0.08, y: 0.34, width: 0.84, height: 0.23 },
              { x: 0.54, y: 0.05, width: 0.38, height: 0.4 },
            ],
        final: { x: 0.3, y: 0.74, width: 0.4, height: 0.18 },
      }
    : {
        initial: { x: 0.07, y: 0.07, width: 0.42, height: 0.45 },
        medial: isTop
          ? [
              { x: 0.08, y: 0.48, width: 0.84, height: 0.34 },
              { x: 0.52, y: 0.07, width: 0.4, height: 0.5 },
            ]
          : [
              { x: 0.08, y: 0.38, width: 0.84, height: 0.34 },
              { x: 0.52, y: 0.07, width: 0.4, height: 0.5 },
            ],
      }
}

function placeComplexVowel(vowel: string, boxes: LayoutBox[]): StrokePath[] {
  const components = COMPLEX_VOWEL_COMPONENTS[vowel]
  if (!components || boxes.length < 2) return []
  const [horizontal, vertical] = components
  return [
    ...place(getSimpleJamoTemplate(horizontal), boxes[0], `medial-${vowel}-h-`),
    ...place(getSimpleJamoTemplate(vertical), boxes[1], `medial-${vowel}-v-`),
  ]
}

function generateSyllable(character: string, initial: string, medial: string, final?: string): GeneratedCharacter {
  const boxes = getSyllableLayoutBoxes(medial, Boolean(final))
  const strokes: StrokePath[] = []
  strokes.push(...place(getSimpleJamoTemplate(initial), boxes.initial, `initial-${initial}-`))

  if (VERTICAL_VOWELS.has(medial) || HORIZONTAL_VOWELS.has(medial)) {
    strokes.push(...place(getSimpleJamoTemplate(medial), boxes.medial[0], `medial-${medial}-`))
  } else {
    strokes.push(...placeComplexVowel(medial, boxes.medial))
  }

  if (final && boxes.final) strokes.push(...placeFinal(final, boxes.final))
  return { character, kind: 'syllable', initial, medial, final, strokes }
}

export function generateCharacterStrokes(character: string): GeneratedCharacter | null {
  const decomposition = decomposeHangulCharacter(character)
  if (decomposition.kind === 'unsupported') return null
  if (decomposition.kind === 'jamo') {
    const template = getSimpleJamoTemplate(character)
    if (!template.length) return null
    const isVowel = isVowelJamo(character)
    return {
      character,
      kind: 'jamo',
      strokes: place(
        template,
        isVowel
          ? { x: 0.12, y: 0.08, width: 0.76, height: 0.84 }
          : { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
        `jamo-${character}-`,
      ),
    }
  }
  return generateSyllable(
    character,
    decomposition.initial as string,
    decomposition.medial as string,
    decomposition.final,
  )
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

export function getStrokeBounds(strokes: StrokePath[]): LayoutBox | null {
  const points: PracticePoint[] = strokes.flatMap((stroke) => stroke.guidePoints)
  if (!points.length) return null
  const minX = Math.min(...points.map((point) => point.x))
  const maxX = Math.max(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const maxY = Math.max(...points.map((point) => point.y))
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

export function getGeneratedComponentBounds(character: GeneratedCharacter): Partial<Record<'initial' | 'medial' | 'final', LayoutBox>> {
  const result: Partial<Record<'initial' | 'medial' | 'final', LayoutBox>> = {}
  if (character.kind !== 'syllable') return result
  const initial = getStrokeBounds(character.strokes.filter((stroke) => stroke.id.startsWith('initial-')))
  const medial = getStrokeBounds(character.strokes.filter((stroke) => stroke.id.startsWith('medial-')))
  const final = getStrokeBounds(character.strokes.filter((stroke) => stroke.id.startsWith('final-')))
  if (initial) result.initial = initial
  if (medial) result.medial = medial
  if (final) result.final = final
  return result
}

export function getVowelLayoutKind(vowel: string): 'vertical' | 'horizontal' | 'complex-top' | 'complex-bottom' | 'complex-eui' {
  if (VERTICAL_VOWELS.has(vowel)) return 'vertical'
  if (HORIZONTAL_VOWELS.has(vowel)) return 'horizontal'
  if (COMPLEX_TOP_VOWELS.has(vowel)) return 'complex-top'
  if (COMPLEX_BOTTOM_VOWELS.has(vowel)) return 'complex-bottom'
  return 'complex-eui'
}
