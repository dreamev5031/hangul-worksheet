import { decomposeHangulCharacter } from './hangulDecompose'
import { COMPLEX_VOWEL_COMPONENTS, FINAL_CLUSTER_COMPONENTS, getSimpleJamoTemplate, isVowelJamo } from './strokeTemplates'
import { transformStroke } from './strokePath'
import type { GeneratedCharacter, StrokePath } from './types'

const VERTICAL_VOWELS = new Set(['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅣ'])
const HORIZONTAL_VOWELS = new Set(['ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ'])
const COMPLEX_TOP_VOWELS = new Set(['ㅘ', 'ㅙ', 'ㅚ'])
const COMPLEX_BOTTOM_VOWELS = new Set(['ㅝ', 'ㅞ', 'ㅟ'])

interface Box { x: number; y: number; width: number; height: number }

function place(strokes: StrokePath[], box: Box, prefix: string): StrokePath[] {
  return strokes.map((stroke, index) => transformStroke(stroke, box, `${prefix}${index + 1}-`))
}

function placeFinal(finalJamo: string, box: Box): StrokePath[] {
  const cluster = FINAL_CLUSTER_COMPONENTS[finalJamo]
  if (!cluster) return place(getSimpleJamoTemplate(finalJamo), box, `final-${finalJamo}-`)
  const [left, right] = cluster
  const gap = 0.03
  const half = (box.width - gap) / 2
  return [
    ...place(getSimpleJamoTemplate(left), { x: box.x, y: box.y, width: half, height: box.height }, `final-${finalJamo}-l-`),
    ...place(getSimpleJamoTemplate(right), { x: box.x + half + gap, y: box.y, width: half, height: box.height }, `final-${finalJamo}-r-`),
  ]
}

function placeComplexVowel(vowel: string, hasFinal: boolean): StrokePath[] {
  const components = COMPLEX_VOWEL_COMPONENTS[vowel]
  if (!components) return []
  const [horizontal, vertical] = components
  if (vowel === 'ㅢ') {
    const top = hasFinal ? 0.34 : 0.46
    return [
      ...place(getSimpleJamoTemplate(horizontal), { x: 0.12, y: top, width: 0.56, height: hasFinal ? 0.22 : 0.3 }, `medial-${vowel}-h-`),
      ...place(getSimpleJamoTemplate(vertical), { x: 0.69, y: hasFinal ? 0.1 : 0.18, width: 0.2, height: hasFinal ? 0.5 : 0.62 }, `medial-${vowel}-v-`),
    ]
  }
  const horizontalY = hasFinal ? 0.45 : 0.58
  const horizontalHeight = hasFinal ? 0.2 : 0.28
  const verticalHeight = hasFinal ? 0.42 : 0.54
  return [
    ...place(getSimpleJamoTemplate(horizontal), { x: 0.08, y: horizontalY, width: 0.84, height: horizontalHeight }, `medial-${vowel}-h-`),
    ...place(getSimpleJamoTemplate(vertical), { x: 0.52, y: 0.07, width: 0.4, height: verticalHeight }, `medial-${vowel}-v-`),
  ]
}

function generateSyllable(character: string, initial: string, medial: string, final?: string): GeneratedCharacter {
  const hasFinal = Boolean(final)
  const strokes: StrokePath[] = []
  const initialTemplate = getSimpleJamoTemplate(initial)

  if (VERTICAL_VOWELS.has(medial)) {
    strokes.push(...place(
      initialTemplate,
      hasFinal
        ? { x: 0.07, y: 0.07, width: 0.41, height: 0.56 }
        : { x: 0.06, y: 0.08, width: 0.43, height: 0.82 },
      `initial-${initial}-`,
    ))
    strokes.push(...place(
      getSimpleJamoTemplate(medial),
      hasFinal
        ? { x: 0.52, y: 0.07, width: 0.41, height: 0.56 }
        : { x: 0.52, y: 0.08, width: 0.42, height: 0.82 },
      `medial-${medial}-`,
    ))
  } else if (HORIZONTAL_VOWELS.has(medial)) {
    strokes.push(...place(
      initialTemplate,
      hasFinal
        ? { x: 0.09, y: 0.05, width: 0.82, height: 0.31 }
        : { x: 0.1, y: 0.06, width: 0.8, height: 0.42 },
      `initial-${initial}-`,
    ))
    strokes.push(...place(
      getSimpleJamoTemplate(medial),
      hasFinal
        ? { x: 0.08, y: 0.36, width: 0.84, height: 0.27 }
        : { x: 0.07, y: 0.49, width: 0.86, height: 0.38 },
      `medial-${medial}-`,
    ))
  } else {
    strokes.push(...place(
      initialTemplate,
      hasFinal
        ? { x: 0.07, y: 0.07, width: 0.4, height: 0.37 }
        : { x: 0.06, y: 0.08, width: 0.42, height: 0.48 },
      `initial-${initial}-`,
    ))
    strokes.push(...placeComplexVowel(medial, hasFinal))
  }

  if (final) {
    strokes.push(...placeFinal(final, { x: 0.09, y: 0.68, width: 0.82, height: 0.25 }))
  }

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
      strokes: place(template, isVowel
        ? { x: 0.13, y: 0.08, width: 0.74, height: 0.84 }
        : { x: 0.09, y: 0.09, width: 0.82, height: 0.82 }, `jamo-${character}-`),
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
      && [...stroke.points, ...stroke.guidePoints, stroke.start, stroke.end].every((point) =>
        Number.isFinite(point.x)
          && Number.isFinite(point.y)
          && point.x >= 0
          && point.x <= 1
          && point.y >= 0
          && point.y <= 1,
      ),
  )
}

export function getVowelLayoutKind(vowel: string): 'vertical' | 'horizontal' | 'complex-top' | 'complex-bottom' | 'complex-eui' {
  if (VERTICAL_VOWELS.has(vowel)) return 'vertical'
  if (HORIZONTAL_VOWELS.has(vowel)) return 'horizontal'
  if (COMPLEX_TOP_VOWELS.has(vowel)) return 'complex-top'
  if (COMPLEX_BOTTOM_VOWELS.has(vowel)) return 'complex-bottom'
  return 'complex-eui'
}
