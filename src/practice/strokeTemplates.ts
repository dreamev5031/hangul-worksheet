import type { PracticePoint, StrokePath, StrokePathKind } from './types'
import { resamplePolyline, transformStroke } from './strokePath'

const DEFAULT_THICKNESS = 0.08
const DEFAULT_TOLERANCE = 0.105

function makeStroke(
  id: string,
  coordinates: Array<[number, number]>,
  options: Partial<Pick<StrokePath, 'thickness' | 'tolerance' | 'curved' | 'closed' | 'pathKind' | 'preserveAspect'>> = {},
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
  const waypoints = pathKind === 'polyline' && !options.closed ? points.slice(1, -1).map((point) => ({ ...point })) : []
  return {
    id,
    points,
    guidePoints: resamplePolyline(points, 64),
    waypoints,
    start,
    end,
    direction: { dx: dx / magnitude, dy: dy / magnitude },
    pathKind,
    closed: options.closed ?? false,
    thickness: options.thickness ?? DEFAULT_THICKNESS,
    tolerance: options.tolerance ?? DEFAULT_TOLERANCE,
    curved: options.curved ?? (pathKind === 'curve' || pathKind === 'closed-curve'),
    preserveAspect: options.preserveAspect ?? false,
  }
}

function circleStroke(id: string, centerX = 0.5, centerY = 0.5, radius = 0.34): StrokePath {
  const points: Array<[number, number]> = []
  const segments = 36
  for (let index = 0; index <= segments; index += 1) {
    const angle = -Math.PI / 2 + (index / segments) * Math.PI * 2
    points.push([centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius])
  }
  return makeStroke(id, points, {
    curved: true,
    closed: true,
    pathKind: 'closed-curve',
    tolerance: 0.12,
    preserveAspect: true,
  })
}

const consonantTemplates: Record<string, StrokePath[]> = {
  'ㄱ': [makeStroke('g-1', [[0.14, 0.16], [0.86, 0.16], [0.86, 0.86]])],
  'ㄴ': [makeStroke('n-1', [[0.16, 0.14], [0.16, 0.84], [0.86, 0.84]])],
  'ㄷ': [
    makeStroke('d-1', [[0.14, 0.16], [0.86, 0.16]]),
    makeStroke('d-2', [[0.14, 0.16], [0.14, 0.84], [0.86, 0.84]]),
  ],
  'ㄹ': [
    makeStroke('r-1', [[0.14, 0.14], [0.86, 0.14]]),
    makeStroke('r-2', [[0.14, 0.14], [0.14, 0.5]]),
    makeStroke('r-3', [[0.14, 0.5], [0.82, 0.5]]),
    makeStroke('r-4', [[0.82, 0.5], [0.82, 0.86]]),
    makeStroke('r-5', [[0.14, 0.86], [0.82, 0.86]]),
  ],
  'ㅁ': [
    makeStroke('m-1', [[0.14, 0.14], [0.14, 0.86]]),
    makeStroke('m-2', [[0.14, 0.14], [0.86, 0.14], [0.86, 0.86]]),
    makeStroke('m-3', [[0.14, 0.86], [0.86, 0.86]]),
  ],
  'ㅂ': [
    makeStroke('b-1', [[0.16, 0.12], [0.16, 0.88]]),
    makeStroke('b-2', [[0.84, 0.12], [0.84, 0.88]]),
    makeStroke('b-3', [[0.16, 0.34], [0.84, 0.34]]),
    makeStroke('b-4', [[0.16, 0.68], [0.84, 0.68]]),
  ],
  'ㅅ': [
    makeStroke('s-1', [[0.5, 0.14], [0.12, 0.86]]),
    makeStroke('s-2', [[0.5, 0.14], [0.88, 0.86]]),
  ],
  'ㅇ': [circleStroke('ng-1')],
  'ㅈ': [
    makeStroke('j-1', [[0.12, 0.16], [0.88, 0.16]]),
    makeStroke('j-2', [[0.5, 0.22], [0.14, 0.86]]),
    makeStroke('j-3', [[0.5, 0.22], [0.86, 0.86]]),
  ],
  'ㅊ': [
    makeStroke('ch-1', [[0.34, 0.08], [0.66, 0.08]]),
    makeStroke('ch-2', [[0.12, 0.28], [0.88, 0.28]]),
    makeStroke('ch-3', [[0.5, 0.34], [0.14, 0.88]]),
    makeStroke('ch-4', [[0.5, 0.34], [0.86, 0.88]]),
  ],
  'ㅋ': [
    makeStroke('k-1', [[0.14, 0.16], [0.86, 0.16], [0.86, 0.86]]),
    makeStroke('k-2', [[0.42, 0.52], [0.86, 0.52]]),
  ],
  'ㅌ': [
    makeStroke('t-1', [[0.14, 0.14], [0.86, 0.14]]),
    makeStroke('t-2', [[0.14, 0.48], [0.86, 0.48]]),
    makeStroke('t-3', [[0.14, 0.14], [0.14, 0.86], [0.86, 0.86]]),
  ],
  'ㅍ': [
    makeStroke('p-1', [[0.12, 0.3], [0.88, 0.3]]),
    makeStroke('p-2', [[0.12, 0.7], [0.88, 0.7]]),
    makeStroke('p-3', [[0.3, 0.12], [0.3, 0.88]]),
    makeStroke('p-4', [[0.7, 0.12], [0.7, 0.88]]),
  ],
  'ㅎ': [
    makeStroke('h-1', [[0.34, 0.08], [0.66, 0.08]]),
    makeStroke('h-2', [[0.14, 0.3], [0.86, 0.3]]),
    circleStroke('h-3', 0.5, 0.68, 0.25),
  ],
}

const vowelTemplates: Record<string, StrokePath[]> = {
  'ㅏ': [
    makeStroke('a-1', [[0.28, 0.1], [0.28, 0.9]]),
    makeStroke('a-2', [[0.28, 0.5], [0.84, 0.5]]),
  ],
  'ㅑ': [
    makeStroke('ya-1', [[0.26, 0.08], [0.26, 0.92]]),
    makeStroke('ya-2', [[0.26, 0.38], [0.82, 0.38]]),
    makeStroke('ya-3', [[0.26, 0.64], [0.82, 0.64]]),
  ],
  'ㅓ': [
    makeStroke('eo-1', [[0.72, 0.1], [0.72, 0.9]]),
    makeStroke('eo-2', [[0.16, 0.5], [0.72, 0.5]]),
  ],
  'ㅕ': [
    makeStroke('yeo-1', [[0.74, 0.08], [0.74, 0.92]]),
    makeStroke('yeo-2', [[0.18, 0.38], [0.74, 0.38]]),
    makeStroke('yeo-3', [[0.18, 0.64], [0.74, 0.64]]),
  ],
  'ㅗ': [
    makeStroke('o-1', [[0.1, 0.68], [0.9, 0.68]]),
    makeStroke('o-2', [[0.5, 0.68], [0.5, 0.14]]),
  ],
  'ㅛ': [
    makeStroke('yo-1', [[0.08, 0.7], [0.92, 0.7]]),
    makeStroke('yo-2', [[0.36, 0.7], [0.36, 0.16]]),
    makeStroke('yo-3', [[0.64, 0.7], [0.64, 0.16]]),
  ],
  'ㅜ': [
    makeStroke('u-1', [[0.08, 0.32], [0.92, 0.32]]),
    makeStroke('u-2', [[0.5, 0.32], [0.5, 0.86]]),
  ],
  'ㅠ': [
    makeStroke('yu-1', [[0.08, 0.3], [0.92, 0.3]]),
    makeStroke('yu-2', [[0.36, 0.3], [0.36, 0.84]]),
    makeStroke('yu-3', [[0.64, 0.3], [0.64, 0.84]]),
  ],
  'ㅡ': [makeStroke('eu-1', [[0.08, 0.5], [0.92, 0.5]])],
  'ㅣ': [makeStroke('i-1', [[0.5, 0.08], [0.5, 0.92]])],
}

function cloneStrokes(strokes: StrokePath[], prefix: string): StrokePath[] {
  return strokes.map((stroke, index) => ({
    ...stroke,
    id: `${prefix}${index + 1}`,
    points: stroke.points.map((point) => ({ ...point })),
    guidePoints: stroke.guidePoints.map((point) => ({ ...point })),
    waypoints: stroke.waypoints.map((point) => ({ ...point })),
    start: { ...stroke.start },
    end: { ...stroke.end },
  }))
}

function combineSideBySide(left: StrokePath[], right: StrokePath[], prefix: string): StrokePath[] {
  return [
    ...left.map((stroke) => transformStroke(stroke, { x: 0.04, y: 0.04, width: 0.43, height: 0.92 }, `${prefix}l-`)),
    ...right.map((stroke) => transformStroke(stroke, { x: 0.53, y: 0.04, width: 0.43, height: 0.92 }, `${prefix}r-`)),
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

function composeVerticalVowel(base: 'ㅏ' | 'ㅓ', extraX: number, prefix: string): StrokePath[] {
  return [
    ...cloneStrokes(vowelTemplates[base], `${prefix}base-`),
    makeStroke(`${prefix}extra-1`, [[extraX, 0.1], [extraX, 0.9]]),
  ]
}

vowelTemplates['ㅐ'] = composeVerticalVowel('ㅏ', 0.82, 'ae-')
vowelTemplates['ㅔ'] = composeVerticalVowel('ㅓ', 0.88, 'e-')
vowelTemplates['ㅒ'] = [...cloneStrokes(vowelTemplates['ㅑ'], 'yae-base-'), makeStroke('yae-extra-1', [[0.84, 0.08], [0.84, 0.92]])]
vowelTemplates['ㅖ'] = [...cloneStrokes(vowelTemplates['ㅕ'], 'ye-base-'), makeStroke('ye-extra-1', [[0.9, 0.08], [0.9, 0.92]])]

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
    const [horizontal, vertical] = COMPLEX_VOWEL_COMPONENTS[jamo]
    const horizontalStrokes = getSimpleJamoTemplate(horizontal)
    const verticalStrokes = getSimpleJamoTemplate(vertical)
    if (jamo === 'ㅢ') {
      return [
        ...horizontalStrokes.map((stroke) => transformStroke(stroke, { x: 0.04, y: 0.5, width: 0.68, height: 0.34 }, `${jamo}-h-`)),
        ...verticalStrokes.map((stroke) => transformStroke(stroke, { x: 0.72, y: 0.06, width: 0.22, height: 0.84 }, `${jamo}-v-`)),
      ]
    }
    const isTop = ['ㅘ', 'ㅙ', 'ㅚ'].includes(jamo)
    return [
      ...horizontalStrokes.map((stroke) => transformStroke(stroke, { x: 0.04, y: isTop ? 0.46 : 0.38, width: 0.9, height: 0.48 }, `${jamo}-h-`)),
      ...verticalStrokes.map((stroke) => transformStroke(stroke, { x: 0.52, y: 0.04, width: 0.42, height: 0.54 }, `${jamo}-v-`)),
    ]
  }
  return []
}
