export const STROKE_STANDARD_VERSION = 'canonical-kids-v2-2026-07'

export type StrokeStandardCategory = 'initial' | 'medial' | 'final'
export type StandardPathKind = 'line' | 'polyline' | 'closed-curve'

export interface StandardStrokeDescription {
  order: number
  start: string
  end: string
  direction: string
  turns: string[]
  pathKind: StandardPathKind
  closed: boolean
}

export interface StrokeStandardEntry {
  jamo: string
  category: StrokeStandardCategory
  strokeCount: number
  strokes: StandardStrokeDescription[]
  composition?: string[]
}

function line(order: number, start: string, end: string, direction: string): StandardStrokeDescription {
  return { order, start, end, direction, turns: [], pathKind: 'line', closed: false }
}

function polyline(order: number, start: string, end: string, direction: string, turns: string[]): StandardStrokeDescription {
  return { order, start, end, direction, turns, pathKind: 'polyline', closed: false }
}

function closed(order: number, start: string, direction: string): StandardStrokeDescription {
  return { order, start, end: start, direction, turns: [], pathKind: 'closed-curve', closed: true }
}

const BASE_CONSONANTS: Record<string, StandardStrokeDescription[]> = {
  'ㄱ': [polyline(1, '왼쪽 위', '오른쪽 아래', '오른쪽 후 아래', ['오른쪽 위'])],
  'ㄴ': [polyline(1, '왼쪽 위', '오른쪽 아래', '아래 후 오른쪽', ['왼쪽 아래'])],
  'ㄷ': [
    line(1, '왼쪽 위', '오른쪽 위', '오른쪽'),
    polyline(2, '왼쪽 위', '오른쪽 아래', '아래 후 오른쪽', ['왼쪽 아래']),
  ],
  'ㄹ': [
    line(1, '왼쪽 위', '오른쪽 위', '오른쪽'),
    line(2, '왼쪽 위', '왼쪽 가운데', '아래'),
    line(3, '왼쪽 가운데', '오른쪽 가운데', '오른쪽'),
    line(4, '오른쪽 가운데', '오른쪽 아래', '아래'),
    line(5, '왼쪽 아래', '오른쪽 아래', '오른쪽'),
  ],
  'ㅁ': [
    line(1, '왼쪽 위', '왼쪽 아래', '아래'),
    polyline(2, '왼쪽 위', '오른쪽 아래', '오른쪽 후 아래', ['오른쪽 위']),
    line(3, '왼쪽 아래', '오른쪽 아래', '오른쪽'),
  ],
  'ㅂ': [
    line(1, '왼쪽 위', '왼쪽 아래', '아래'),
    line(2, '오른쪽 위', '오른쪽 아래', '아래'),
    line(3, '왼쪽 위쪽 가운데', '오른쪽 위쪽 가운데', '오른쪽'),
    line(4, '왼쪽 아래쪽 가운데', '오른쪽 아래쪽 가운데', '오른쪽'),
  ],
  'ㅅ': [
    line(1, '위 꼭짓점', '왼쪽 아래', '왼쪽 아래'),
    line(2, '위 꼭짓점', '오른쪽 아래', '오른쪽 아래'),
  ],
  'ㅇ': [closed(1, '위 중앙', '시계 방향')],
  'ㅈ': [
    line(1, '왼쪽 위', '오른쪽 위', '오른쪽'),
    line(2, '위 중앙', '왼쪽 아래', '왼쪽 아래'),
    line(3, '위 중앙', '오른쪽 아래', '오른쪽 아래'),
  ],
  'ㅊ': [
    line(1, '위 왼쪽', '위 오른쪽', '오른쪽'),
    line(2, '가운데 왼쪽', '가운데 오른쪽', '오른쪽'),
    line(3, '가운데 위', '왼쪽 아래', '왼쪽 아래'),
    line(4, '가운데 위', '오른쪽 아래', '오른쪽 아래'),
  ],
  'ㅋ': [
    polyline(1, '왼쪽 위', '오른쪽 아래', '오른쪽 후 아래', ['오른쪽 위']),
    line(2, '가운데', '오른쪽 가운데', '오른쪽'),
  ],
  'ㅌ': [
    line(1, '왼쪽 위', '오른쪽 위', '오른쪽'),
    line(2, '왼쪽 가운데', '오른쪽 가운데', '오른쪽'),
    polyline(3, '왼쪽 위', '오른쪽 아래', '아래 후 오른쪽', ['왼쪽 아래']),
  ],
  'ㅍ': [
    line(1, '왼쪽 위 가로', '오른쪽 위 가로', '오른쪽'),
    line(2, '왼쪽 아래 가로', '오른쪽 아래 가로', '오른쪽'),
    line(3, '왼쪽 위', '왼쪽 아래', '아래'),
    line(4, '오른쪽 위', '오른쪽 아래', '아래'),
  ],
  'ㅎ': [
    line(1, '맨 위 왼쪽', '맨 위 오른쪽', '오른쪽'),
    line(2, '가운데 왼쪽', '가운데 오른쪽', '오른쪽'),
    closed(3, '아래 원 위 중앙', '시계 방향'),
  ],
}

const BASE_VOWELS: Record<string, StandardStrokeDescription[]> = {
  'ㅏ': [line(1, '세로 위', '세로 아래', '아래'), line(2, '세로 가운데', '오른쪽', '오른쪽')],
  'ㅑ': [line(1, '세로 위', '세로 아래', '아래'), line(2, '세로 위쪽', '오른쪽', '오른쪽'), line(3, '세로 아래쪽', '오른쪽', '오른쪽')],
  'ㅓ': [line(1, '세로 위', '세로 아래', '아래'), line(2, '왼쪽', '세로 가운데', '오른쪽')],
  'ㅕ': [line(1, '세로 위', '세로 아래', '아래'), line(2, '왼쪽 위쪽', '세로 위쪽', '오른쪽'), line(3, '왼쪽 아래쪽', '세로 아래쪽', '오른쪽')],
  'ㅗ': [line(1, '가로 왼쪽', '가로 오른쪽', '오른쪽'), line(2, '가로 가운데', '위', '위')],
  'ㅛ': [line(1, '가로 왼쪽', '가로 오른쪽', '오른쪽'), line(2, '왼쪽 가운데', '왼쪽 위', '위'), line(3, '오른쪽 가운데', '오른쪽 위', '위')],
  'ㅜ': [line(1, '가로 왼쪽', '가로 오른쪽', '오른쪽'), line(2, '가로 가운데', '아래', '아래')],
  'ㅠ': [line(1, '가로 왼쪽', '가로 오른쪽', '오른쪽'), line(2, '왼쪽 가운데', '왼쪽 아래', '아래'), line(3, '오른쪽 가운데', '오른쪽 아래', '아래')],
  'ㅡ': [line(1, '왼쪽', '오른쪽', '오른쪽')],
  'ㅣ': [line(1, '위', '아래', '아래')],
}

const DOUBLE_CONSONANTS: Record<string, string> = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ' }
const COMPOUND_VOWELS: Record<string, string[]> = {
  'ㅐ': ['ㅏ', 'ㅣ'], 'ㅒ': ['ㅑ', 'ㅣ'], 'ㅔ': ['ㅓ', 'ㅣ'], 'ㅖ': ['ㅕ', 'ㅣ'],
  'ㅘ': ['ㅗ', 'ㅏ'], 'ㅙ': ['ㅗ', 'ㅐ'], 'ㅚ': ['ㅗ', 'ㅣ'],
  'ㅝ': ['ㅜ', 'ㅓ'], 'ㅞ': ['ㅜ', 'ㅔ'], 'ㅟ': ['ㅜ', 'ㅣ'], 'ㅢ': ['ㅡ', 'ㅣ'],
}
export const FINAL_CLUSTER_STANDARD_COMPONENTS: Record<string, string[]> = {
  'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'], 'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'],
  'ㄼ': ['ㄹ', 'ㅂ'], 'ㄽ': ['ㄹ', 'ㅅ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'], 'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ'],
}
const SIMPLE_FINALS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

function renumber(strokes: StandardStrokeDescription[]): StandardStrokeDescription[] {
  return strokes.map((stroke, index) => ({ ...stroke, order: index + 1 }))
}

function composeDescriptions(components: string[], source: Record<string, StandardStrokeDescription[]>): StandardStrokeDescription[] {
  return renumber(components.flatMap((component) => source[component].map((stroke) => ({ ...stroke }))))
}

export const INITIAL_STROKE_STANDARD: Record<string, StrokeStandardEntry> = {}
for (const [jamo, strokes] of Object.entries(BASE_CONSONANTS)) {
  INITIAL_STROKE_STANDARD[jamo] = { jamo, category: 'initial', strokeCount: strokes.length, strokes }
}
for (const [jamo, base] of Object.entries(DOUBLE_CONSONANTS)) {
  const strokes = composeDescriptions([base, base], BASE_CONSONANTS)
  INITIAL_STROKE_STANDARD[jamo] = { jamo, category: 'initial', strokeCount: strokes.length, strokes, composition: [base, base] }
}

const SIMPLE_AND_COMPOUND_VOWELS: Record<string, StandardStrokeDescription[]> = { ...BASE_VOWELS }
SIMPLE_AND_COMPOUND_VOWELS['ㅐ'] = [...BASE_VOWELS['ㅏ'], line(3, '오른쪽 세로 위', '오른쪽 세로 아래', '아래')]
SIMPLE_AND_COMPOUND_VOWELS['ㅔ'] = [...BASE_VOWELS['ㅓ'], line(3, '오른쪽 세로 위', '오른쪽 세로 아래', '아래')]
SIMPLE_AND_COMPOUND_VOWELS['ㅒ'] = [...BASE_VOWELS['ㅑ'], line(4, '오른쪽 세로 위', '오른쪽 세로 아래', '아래')]
SIMPLE_AND_COMPOUND_VOWELS['ㅖ'] = [...BASE_VOWELS['ㅕ'], line(4, '오른쪽 세로 위', '오른쪽 세로 아래', '아래')]
for (const [jamo, components] of Object.entries(COMPOUND_VOWELS)) {
  if (!SIMPLE_AND_COMPOUND_VOWELS[jamo]) {
    SIMPLE_AND_COMPOUND_VOWELS[jamo] = composeDescriptions(components, SIMPLE_AND_COMPOUND_VOWELS)
  }
}

export const MEDIAL_STROKE_STANDARD: Record<string, StrokeStandardEntry> = {}
for (const [jamo, strokes] of Object.entries(SIMPLE_AND_COMPOUND_VOWELS)) {
  MEDIAL_STROKE_STANDARD[jamo] = {
    jamo,
    category: 'medial',
    strokeCount: strokes.length,
    strokes,
    composition: COMPOUND_VOWELS[jamo],
  }
}

export const FINAL_STROKE_STANDARD: Record<string, StrokeStandardEntry> = {}
for (const jamo of SIMPLE_FINALS) {
  const initial = INITIAL_STROKE_STANDARD[jamo]
  FINAL_STROKE_STANDARD[jamo] = { ...initial, category: 'final' }
}
for (const [jamo, components] of Object.entries(FINAL_CLUSTER_STANDARD_COMPONENTS)) {
  const strokes = renumber(components.flatMap((component) => INITIAL_STROKE_STANDARD[component].strokes.map((stroke) => ({ ...stroke }))))
  FINAL_STROKE_STANDARD[jamo] = { jamo, category: 'final', strokeCount: strokes.length, strokes, composition: components }
}

export function getExpectedStrokeCount(jamo: string, category?: StrokeStandardCategory): number | undefined {
  if (category === 'initial') return INITIAL_STROKE_STANDARD[jamo]?.strokeCount
  if (category === 'medial') return MEDIAL_STROKE_STANDARD[jamo]?.strokeCount
  if (category === 'final') return FINAL_STROKE_STANDARD[jamo]?.strokeCount
  return INITIAL_STROKE_STANDARD[jamo]?.strokeCount
    ?? MEDIAL_STROKE_STANDARD[jamo]?.strokeCount
    ?? FINAL_STROKE_STANDARD[jamo]?.strokeCount
}
