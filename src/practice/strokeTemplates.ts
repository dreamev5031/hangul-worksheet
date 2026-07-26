import type { PracticePoint, StrokePath, StrokePathKind } from './types'
import { resamplePolyline, transformStroke } from './strokePath'

const DEFAULT_THICKNESS = 0.075
const DEFAULT_TOLERANCE = 0.105

function makeStroke(
  id: string,
  coordinates: Array<[number, number]>,
  options: Partial<Pick<StrokePath, 'thickness' | 'tolerance' | 'curved' | 'closed' | 'pathKind'>> = {},
): StrokePath {
  const points: PracticePoint[] = coordinates.map(([x, y]) => ({ x, y }))
  const start = points[0]
  const end = points[points.length - 1]
  const directionTarget = options.closed && points.length > 2 ? points[Math.max(1, Math.floor(points.length * 0.2))] : end
  const dx = directionTarget.x - start.x
  const dy = directionTarget.y - start.y
  const magnitude = Math.hypot(dx, dy) || 1
  const pathKind: StrokePathKind = options.pathKind
    ?? (options.closed ? 'closed-curve' : options.curved ? 'curve' : coordinates.length > 2 ? 'polyline' : 'line')
  return {
    id,
    points,
    start,
    end,
    direction: { dx: dx / magnitude, dy: dy / magnitude },
    pathKind,
    closed: options.closed ?? false,
    thickness: options.thickness ?? DEFAULT_THICKNESS,
    tolerance: options.tolerance ?? DEFAULT_TOLERANCE,
    curved: options.curved ?? (pathKind === 'curve' || pathKind === 'closed-curve'),
    guidePoints: resamplePolyline(points, 48),
  }
}

function circleStroke(id: string, centerX = 0.5, centerY = 0.5, radiusX = 0.31, radiusY = 0.31): StrokePath {
  const points: Array<[number, number]> = []
  const segments = 28
  for (let index = 0; index <= segments; index += 1) {
    const angle = -Math.PI / 2 + (index / segments) * Math.PI * 2
    points.push([centerX + Math.cos(angle) * radiusX, centerY + Math.sin(angle) * radiusY])
  }
  return makeStroke(id, points, { curved: true, closed: true, pathKind: 'closed-curve', tolerance: 0.12 })
}

const consonantTemplates: Record<string, StrokePath[]> = {
  'ㄱ': [makeStroke('g-1', [[0.18, 0.2], [0.8, 0.2], [0.8, 0.82]])],
  'ㄴ': [makeStroke('n-1', [[0.22, 0.18], [0.22, 0.78], [0.82, 0.78]])],
  'ㄷ': [
    makeStroke('d-1', [[0.2, 0.2], [0.8, 0.2]]),
    makeStroke('d-2', [[0.2, 0.2], [0.2, 0.8]]),
    makeStroke('d-3', [[0.2, 0.8], [0.8, 0.8]]),
  ],
  'ㄹ': [
    makeStroke('r-1', [[0.2, 0.18], [0.8, 0.18]]),
    makeStroke('r-2', [[0.2, 0.18], [0.2, 0.46]]),
    makeStroke('r-3', [[0.2, 0.46], [0.74, 0.46]]),
    makeStroke('r-4', [[0.74, 0.46], [0.74, 0.8]]),
    makeStroke('r-5', [[0.2, 0.8], [0.74, 0.8]]),
  ],
  'ㅁ': [
    makeStroke('m-1', [[0.2, 0.18], [0.2, 0.82]]),
    makeStroke('m-2', [[0.2, 0.18], [0.8, 0.18], [0.8, 0.82]]),
    makeStroke('m-3', [[0.2, 0.82], [0.8, 0.82]]),
  ],
  'ㅂ': [
    makeStroke('b-1', [[0.24, 0.16], [0.24, 0.84]]),
    makeStroke('b-2', [[0.76, 0.16], [0.76, 0.84]]),
    makeStroke('b-3', [[0.24, 0.28], [0.76, 0.28]]),
    makeStroke('b-4', [[0.24, 0.7], [0.76, 0.7]]),
  ],
  'ㅅ': [
    makeStroke('s-1', [[0.5, 0.18], [0.2, 0.82]]),
    makeStroke('s-2', [[0.5, 0.18], [0.8, 0.82]]),
  ],
  'ㅇ': [circleStroke('ng-1')],
  'ㅈ': [
    makeStroke('j-1', [[0.2, 0.2], [0.8, 0.2]]),
    makeStroke('j-2', [[0.5, 0.24], [0.2, 0.82]]),
    makeStroke('j-3', [[0.5, 0.24], [0.8, 0.82]]),
  ],
  'ㅊ': [
    makeStroke('ch-1', [[0.34, 0.12], [0.66, 0.12]]),
    makeStroke('ch-2', [[0.2, 0.28], [0.8, 0.28]]),
    makeStroke('ch-3', [[0.5, 0.32], [0.2, 0.84]]),
    makeStroke('ch-4', [[0.5, 0.32], [0.8, 0.84]]),
  ],
  'ㅋ': [
    makeStroke('k-1', [[0.18, 0.2], [0.8, 0.2], [0.8, 0.82]]),
    makeStroke('k-2', [[0.4, 0.5], [0.8, 0.5]]),
  ],
  'ㅌ': [
    makeStroke('t-1', [[0.2, 0.18], [0.8, 0.18]]),
    makeStroke('t-2', [[0.2, 0.5], [0.8, 0.5]]),
    makeStroke('t-3', [[0.2, 0.18], [0.2, 0.82]]),
    makeStroke('t-4', [[0.2, 0.82], [0.8, 0.82]]),
  ],
  'ㅍ': [
    makeStroke('p-1', [[0.18, 0.28], [0.82, 0.28]]),
    makeStroke('p-2', [[0.18, 0.72], [0.82, 0.72]]),
    makeStroke('p-3', [[0.32, 0.14], [0.32, 0.86]]),
    makeStroke('p-4', [[0.68, 0.14], [0.68, 0.86]]),
  ],
  'ㅎ': [
    makeStroke('h-1', [[0.34, 0.14], [0.66, 0.14]]),
    makeStroke('h-2', [[0.2, 0.32], [0.8, 0.32]]),
    circleStroke('h-3', 0.5, 0.65, 0.28, 0.22),
  ],
}

const vowelTemplates: Record<string, StrokePath[]> = {
  'ㅏ': [
    makeStroke('a-1', [[0.46, 0.14], [0.46, 0.86]]),
    makeStroke('a-2', [[0.46, 0.5], [0.82, 0.5]]),
  ],
  'ㅑ': [
    makeStroke('ya-1', [[0.42, 0.12], [0.42, 0.88]]),
    makeStroke('ya-2', [[0.42, 0.4], [0.8, 0.4]]),
    makeStroke('ya-3', [[0.42, 0.62], [0.8, 0.62]]),
  ],
  'ㅓ': [
    makeStroke('eo-1', [[0.56, 0.14], [0.56, 0.86]]),
    makeStroke('eo-2', [[0.18, 0.5], [0.56, 0.5]]),
  ],
  'ㅕ': [
    makeStroke('yeo-1', [[0.58, 0.12], [0.58, 0.88]]),
    makeStroke('yeo-2', [[0.18, 0.4], [0.58, 0.4]]),
    makeStroke('yeo-3', [[0.18, 0.62], [0.58, 0.62]]),
  ],
  'ㅗ': [
    makeStroke('o-1', [[0.16, 0.64], [0.84, 0.64]]),
    makeStroke('o-2', [[0.5, 0.64], [0.5, 0.2]]),
  ],
  'ㅛ': [
    makeStroke('yo-1', [[0.14, 0.68], [0.86, 0.68]]),
    makeStroke('yo-2', [[0.38, 0.68], [0.38, 0.24]]),
    makeStroke('yo-3', [[0.62, 0.68], [0.62, 0.24]]),
  ],
  'ㅜ': [
    makeStroke('u-1', [[0.14, 0.36], [0.86, 0.36]]),
    makeStroke('u-2', [[0.5, 0.36], [0.5, 0.82]]),
  ],
  'ㅠ': [
    makeStroke('yu-1', [[0.14, 0.32], [0.86, 0.32]]),
    makeStroke('yu-2', [[0.38, 0.32], [0.38, 0.78]]),
    makeStroke('yu-3', [[0.62, 0.32], [0.62, 0.78]]),
  ],
  'ㅡ': [makeStroke('eu-1', [[0.14, 0.5], [0.86, 0.5]])],
  'ㅣ': [makeStroke('i-1', [[0.5, 0.12], [0.5, 0.88]])],
}

function cloneStrokes(strokes: StrokePath[], prefix: string): StrokePath[] {
  return strokes.map((stroke, index) => ({
    ...stroke,
    id: `${prefix}${index + 1}`,
    points: stroke.points.map((point) => ({ ...point })),
    guidePoints: stroke.guidePoints.map((point) => ({ ...point })),
    start: { ...stroke.start },
    end: { ...stroke.end },
  }))
}

function combineSideBySide(left: StrokePath[], right: StrokePath[], prefix: string): StrokePath[] {
  return [
    ...left.map((stroke) => transformStroke(stroke, { x: 0.05, y: 0.04, width: 0.43, height: 0.92 }, `${prefix}l-`)),
    ...right.map((stroke) => transformStroke(stroke, { x: 0.52, y: 0.04, width: 0.43, height: 0.92 }, `${prefix}r-`)),
  ]
}

function getDoubleConsonant(base: string, prefix: string): StrokePath[] {
  const template = consonantTemplates[base]
  return combineSideBySide(template, template, prefix)
}

consonantTemplates['ㄲ'] = getDoubleConsonant('ㄱ', 'gg-')
consonantTemplates['ㄸ'] = getDoubleConsonant('ㄷ', 'dd-')
consonantTemplates['ㅃ'] = getDoubleConsonant('ㅂ', 'bb-')
consonantTemplates['ㅆ'] = getDoubleConsonant('ㅅ', 'ss-')
consonantTemplates['ㅉ'] = getDoubleConsonant('ㅈ', 'jj-')

function composeVerticalVowel(base: 'ㅏ' | 'ㅓ', rightLine: boolean, prefix: string): StrokePath[] {
  const baseStrokes = cloneStrokes(vowelTemplates[base], `${prefix}base-`)
  const extraX = rightLine ? 0.78 : 0.22
  return [...baseStrokes, makeStroke(`${prefix}extra-1`, [[extraX, 0.14], [extraX, 0.86]])]
}

vowelTemplates['ㅐ'] = composeVerticalVowel('ㅏ', true, 'ae-')
vowelTemplates['ㅔ'] = composeVerticalVowel('ㅓ', true, 'e-')
vowelTemplates['ㅒ'] = [...cloneStrokes(vowelTemplates['ㅑ'], 'yae-base-'), makeStroke('yae-extra-1', [[0.78, 0.12], [0.78, 0.88]])]
vowelTemplates['ㅖ'] = [...cloneStrokes(vowelTemplates['ㅕ'], 'ye-base-'), makeStroke('ye-extra-1', [[0.8, 0.12], [0.8, 0.88]])]

export const COMPLEX_VOWEL_COMPONENTS: Record<string, string[]> = {
  'ㅘ': ['ㅗ', 'ㅏ'],
  'ㅙ': ['ㅗ', 'ㅐ'],
  'ㅚ': ['ㅗ', 'ㅣ'],
  'ㅝ': ['ㅜ', 'ㅓ'],
  'ㅞ': ['ㅜ', 'ㅔ'],
  'ㅟ': ['ㅜ', 'ㅣ'],
  'ㅢ': ['ㅡ', 'ㅣ'],
}

export const FINAL_CLUSTER_COMPONENTS: Record<string, [string, string]> = {
  'ㄳ': ['ㄱ', 'ㅅ'],
  'ㄵ': ['ㄴ', 'ㅈ'],
  'ㄶ': ['ㄴ', 'ㅎ'],
  'ㄺ': ['ㄹ', 'ㄱ'],
  'ㄻ': ['ㄹ', 'ㅁ'],
  'ㄼ': ['ㄹ', 'ㅂ'],
  'ㄽ': ['ㄹ', 'ㅅ'],
  'ㄾ': ['ㄹ', 'ㅌ'],
  'ㄿ': ['ㄹ', 'ㅍ'],
  'ㅀ': ['ㄹ', 'ㅎ'],
  'ㅄ': ['ㅂ', 'ㅅ'],
}

export function isVowelJamo(jamo: string): boolean {
  return Boolean(vowelTemplates[jamo] || COMPLEX_VOWEL_COMPONENTS[jamo])
}

export function getSimpleJamoTemplate(jamo: string): StrokePath[] {
  if (consonantTemplates[jamo]) return cloneStrokes(consonantTemplates[jamo], `${jamo}-`)
  if (vowelTemplates[jamo]) return cloneStrokes(vowelTemplates[jamo], `${jamo}-`)
  if (FINAL_CLUSTER_COMPONENTS[jamo]) {
    const [left, right] = FINAL_CLUSTER_COMPONENTS[jamo]
    return combineSideBySide(getSimpleJamoTemplate(left), getSimpleJamoTemplate(right), `${jamo}-`)
  }
  if (COMPLEX_VOWEL_COMPONENTS[jamo]) {
    const [first, second] = COMPLEX_VOWEL_COMPONENTS[jamo]
    const firstStrokes = getSimpleJamoTemplate(first)
    const secondStrokes = getSimpleJamoTemplate(second)
    if (jamo === 'ㅢ') {
      return [
        ...firstStrokes.map((stroke) => transformStroke(stroke, { x: 0.06, y: 0.5, width: 0.62, height: 0.4 }, `${jamo}-h-`)),
        ...secondStrokes.map((stroke) => transformStroke(stroke, { x: 0.7, y: 0.08, width: 0.24, height: 0.84 }, `${jamo}-v-`)),
      ]
    }
    const isTop = ['ㅘ', 'ㅙ', 'ㅚ'].includes(jamo)
    return [
      ...firstStrokes.map((stroke) => transformStroke(stroke, { x: 0.06, y: isTop ? 0.46 : 0.44, width: 0.88, height: 0.46 }, `${jamo}-h-`)),
      ...secondStrokes.map((stroke) => transformStroke(stroke, { x: 0.5, y: 0.06, width: 0.44, height: 0.5 }, `${jamo}-v-`)),
    ]
  }
  return []
}
