const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

const { parsePracticeItems } = require('../.test-dist/parser.js')
const {
  INITIALS,
  MEDIALS,
  FINALS,
  decomposeHangulCharacter,
  isSupportedHangulCharacter,
} = require('../.test-dist/hangulDecompose.js')
const {
  generateCharacterStrokes,
  getVowelLayoutKind,
  isGeneratedCharacterInBounds,
} = require('../.test-dist/syllableLayout.js')
const {
  BASE_STROKE_VALIDATION_CONFIG,
  getAssistedValidationConfig,
  validateStroke,
} = require('../.test-dist/strokeValidator.js')
const session = require('../.test-dist/session.js')
const storage = require('../.test-dist/storage.js')
const { calculatePracticeLayout } = require('../.test-dist/layout.js')
const { createAudioFeedbackController, FEEDBACK_TONES } = require('../.test-dist/audioFeedback.js')

class MemoryStorage {
  constructor() { this.data = new Map() }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null }
  setItem(key, value) { this.data.set(key, String(value)) }
  removeItem(key) { this.data.delete(key) }
  clear() { this.data.clear() }
}

global.localStorage = new MemoryStorage()
global.sessionStorage = new MemoryStorage()

function clonePoints(points) {
  return points.map((point) => ({ ...point }))
}

test('화면 연습 입력은 한글만 추리고 공백·중복을 제거하며 입력 순서를 유지한다', () => {
  const parsed = parsePracticeItems('ㄱ\n가\n사과\n김민준\n가, A1🙂')
  assert.deepEqual(parsed.items, ['ㄱ', '가', '사', '과', '김', '민', '준'])
  assert.ok(parsed.excluded.includes('A'))
  assert.ok(parsed.excluded.includes('1'))
  assert.ok(parsed.excluded.includes('🙂'))
  assert.equal(parsed.truncated, false)
})

test('화면 연습은 앞의 한글 10개만 사용한다', () => {
  const parsed = parsePracticeItems('가나다라마바사아자차카타')
  assert.equal(parsed.items.length, 10)
  assert.equal(parsed.totalBeforeLimit, 12)
  assert.equal(parsed.truncated, true)
})

test('한글 음절과 호환 자모를 정확히 구분하고 분해한다', () => {
  assert.equal(isSupportedHangulCharacter('가'), true)
  assert.equal(isSupportedHangulCharacter('ㄳ'), true)
  assert.equal(isSupportedHangulCharacter('A'), false)
  assert.deepEqual(decomposeHangulCharacter('가'), {
    kind: 'syllable', character: '가', initial: 'ㄱ', medial: 'ㅏ', final: undefined,
  })
  assert.deepEqual(decomposeHangulCharacter('힣'), {
    kind: 'syllable', character: '힣', initial: 'ㅎ', medial: 'ㅣ', final: 'ㅎ',
  })
  assert.deepEqual(decomposeHangulCharacter('ㄱ'), { kind: 'jamo', character: 'ㄱ' })
})

test('초성 19개·중성 21개·현대 받침과 호환 자모에서 획이 생성된다', () => {
  const jamo = new Set([...INITIALS, ...MEDIALS, ...FINALS.filter(Boolean)])
  for (const character of jamo) {
    const generated = generateCharacterStrokes(character)
    assert.ok(generated, `획 생성 실패: ${character}`)
    assert.ok(generated.strokes.length > 0, `빈 획: ${character}`)
    assert.equal(isGeneratedCharacterInBounds(generated), true, `좌표 범위 오류: ${character}`)
  }
})

test('현대 한글 완성형 11,172개 전체에서 획 생성 실패와 범위 이탈이 없다', () => {
  let generatedCount = 0
  for (let code = 0xac00; code <= 0xd7a3; code += 1) {
    const character = String.fromCodePoint(code)
    const generated = generateCharacterStrokes(character)
    assert.ok(generated, `획 생성 실패: U+${code.toString(16).toUpperCase()} ${character}`)
    assert.ok(generated.strokes.length > 0, `빈 획: ${character}`)
    assert.equal(isGeneratedCharacterInBounds(generated), true, `좌표 범위 오류: ${character}`)
    generatedCount += 1
  }
  assert.equal(generatedCount, 11172)
})

test('세로·가로·복합 모음 배치 종류를 구분한다', () => {
  assert.equal(getVowelLayoutKind('ㅏ'), 'vertical')
  assert.equal(getVowelLayoutKind('ㅗ'), 'horizontal')
  assert.equal(getVowelLayoutKind('ㅘ'), 'complex-top')
  assert.equal(getVowelLayoutKind('ㅝ'), 'complex-bottom')
  assert.equal(getVowelLayoutKind('ㅢ'), 'complex-eui')
})

test('기준 획과 조금 흔들린 획은 성공한다', () => {
  const reference = generateCharacterStrokes('ㄱ').strokes[0]
  const exact = clonePoints(reference.guidePoints)
  const noisy = exact.map((point, index) => {
    if (index === 0 || index === exact.length - 1) return point
    return { ...point, x: point.x + Math.sin(index * 0.8) * 0.006, y: point.y + Math.cos(index * 0.7) * 0.006 }
  })
  assert.equal(validateStroke(exact, reference).accepted, true)
  assert.equal(validateStroke(noisy, reference).accepted, true)
})

test('역방향·다른 위치·너무 짧은 입력·마구 칠하기는 실패한다', () => {
  const reference = generateCharacterStrokes('ㄱ').strokes[0]
  const exact = clonePoints(reference.guidePoints)
  const reverse = clonePoints(exact).reverse()
  const shifted = exact.map((point) => ({ x: Math.min(0.99, point.x + 0.24), y: Math.min(0.99, point.y + 0.2) }))
  const tooShort = [
    { ...reference.start },
    {
      x: reference.start.x + (reference.end.x - reference.start.x) * 0.04,
      y: reference.start.y + (reference.end.y - reference.start.y) * 0.04,
    },
  ]
  const scribble = [
    { ...reference.start },
    { x: 0.04, y: 0.04 }, { x: 0.96, y: 0.04 }, { x: 0.96, y: 0.96 }, { x: 0.04, y: 0.96 },
    { x: 0.04, y: 0.04 }, { x: 0.96, y: 0.04 }, { x: 0.96, y: 0.96 }, { x: 0.04, y: 0.96 },
    { ...reference.end },
  ]
  assert.equal(validateStroke(reverse, reference).reason, 'reverse-direction')
  assert.equal(validateStroke(shifted, reference).accepted, false)
  assert.equal(validateStroke(tooShort, reference).reason, 'too-short')
  assert.equal(validateStroke(scribble, reference).reason, 'scribble')
})

test('세 번째 재시도부터 허용 범위와 경로 수용 기준이 완화된다', () => {
  const reference = generateCharacterStrokes('가').strokes[0]
  const base = getAssistedValidationConfig(0, reference)
  const assisted = getAssistedValidationConfig(3, reference)
  assert.ok(assisted.baseTolerance > base.baseTolerance)
  assert.ok(assisted.startToleranceMultiplier > base.startToleranceMultiplier)
  assert.ok(assisted.minimumNearRatio < base.minimumNearRatio)
  assert.ok(assisted.minimumCoverageRatio < base.minimumCoverageRatio)
  assert.equal(BASE_STROKE_VALIDATION_CONFIG.minimumNearRatio, base.minimumNearRatio)
})

test('실패하면 같은 획을 유지하고 성공하면 다음 획·다음 글자로 이동한다', () => {
  let state = session.createPracticeSessionState(['ㄱ', '가'], '2026-07-26T10:00:00.000Z')
  state = session.applyStrokeOutcome(state, false, 1)
  assert.equal(state.currentItemIndex, 0)
  assert.equal(state.currentStrokeIndex, 0)
  assert.equal(state.currentStrokeRetryCount, 1)
  assert.equal(state.totalRetryCount, 1)

  state = session.applyStrokeOutcome(state, true, 1)
  assert.equal(state.currentItemIndex, 1)
  assert.equal(state.currentStrokeIndex, 0)
  assert.equal(state.completed, false)

  const gaStrokeCount = generateCharacterStrokes('가').strokes.length
  for (let index = 0; index < gaStrokeCount; index += 1) {
    state = session.applyStrokeOutcome(state, true, gaStrokeCount, '2026-07-26T10:02:00.000Z')
    if (index < gaStrokeCount - 1) assert.equal(state.completed, false)
  }
  assert.equal(state.completed, true)
  assert.equal(state.completedAt, '2026-07-26T10:02:00.000Z')
})

test('현재 글자 처음부터 기능은 완료 획만 초기화하고 전체 재시도 기록은 보존한다', () => {
  const state = {
    ...session.createPracticeSessionState(['가']),
    currentStrokeIndex: 2,
    completedStrokeCount: 2,
    currentStrokeRetryCount: 2,
    totalRetryCount: 4,
    itemRetryCounts: { '가': 4 },
  }
  const restarted = session.restartCurrentCharacter(state)
  assert.equal(restarted.currentStrokeIndex, 0)
  assert.equal(restarted.completedStrokeCount, 0)
  assert.equal(restarted.currentStrokeRetryCount, 0)
  assert.equal(restarted.totalRetryCount, 4)
  assert.deepEqual(restarted.itemRetryCounts, { '가': 4 })
})

test('완료 기반 v2 기록은 필기 좌표·이미지·점수를 저장하지 않는다', () => {
  localStorage.clear()
  const completedState = {
    ...session.createPracticeSessionState(['가', '나'], '2026-07-26T10:00:00.000Z'),
    currentItemIndex: 1,
    itemRetryCounts: { '가': 2 },
    totalRetryCount: 2,
    completed: true,
    completedAt: '2026-07-26T10:03:00.000Z',
  }
  const record = storage.createSessionRecord(completedState)
  storage.savePracticeSession(record)
  const loaded = storage.loadPracticeRecords()
  assert.equal(loaded.length, 1)
  assert.equal(loaded[0].version, 2)
  assert.equal(loaded[0].completedCount, 2)
  assert.equal(loaded[0].totalRetries, 2)
  assert.deepEqual(loaded[0].retriedItems, ['가'])
  const serialized = JSON.stringify(loaded)
  assert.equal(/points|image|canvas|score|점수/i.test(serialized), false)
})

test('기존 v1 점수 기록은 오류 없이 완료·재시도 기반 v2로 변환된다', () => {
  localStorage.clear()
  localStorage.setItem(storage.PRACTICE_RECORDS_V1_KEY, JSON.stringify([{
    id: 'legacy-1',
    date: '2026-07-25',
    createdAt: '2026-07-25T10:00:00.000Z',
    items: [{ item: '나', attempts: 3 }, { item: '다', attempts: 1 }],
    totalAttempts: 4,
  }]))
  const migrated = storage.loadPracticeRecords()
  assert.equal(migrated.length, 1)
  assert.equal(migrated[0].version, 2)
  assert.equal(migrated[0].completed, true)
  assert.deepEqual(migrated[0].retryCounts, { '나': 2, '다': 0 })
  assert.deepEqual(migrated[0].retriedItems, ['나'])
  storage.deletePracticeRecords()
  assert.deepEqual(storage.loadPracticeRecords(), [])
})

test('세션 설정은 한글 원문만 안전하게 저장하고 복원한다', () => {
  localStorage.clear()
  session.savePracticeConfig({ rawText: '사과' })
  assert.deepEqual(session.loadPracticeConfig(), { rawText: '사과' })
  localStorage.setItem(session.PRACTICE_CONFIG_KEY, '{broken')
  assert.equal(session.loadPracticeConfig(), null)
})

test('지정 모바일·태블릿·가로 화면에서 캔버스 크기는 실제 사용 가능 공간 안에 든다', () => {
  const viewports = [
    [360, 740], [390, 844], [412, 915], [768, 1024], [800, 1200], [1024, 600], [1280, 800],
  ]
  for (const [width, height] of viewports) {
    const metrics = calculatePracticeLayout({ width, height })
    assert.ok(metrics.canvasSide >= 160, `${width}x${height} 캔버스가 너무 작음`)
    assert.ok(metrics.canvasSide <= metrics.availableWidth, `${width}x${height} 너비 초과`)
    assert.ok(metrics.canvasSide <= metrics.availableHeight, `${width}x${height} 높이 초과`)
    assert.ok(metrics.canvasSide <= 720, `${width}x${height} 최대값 초과`)
  }
})

test('오디오 실패와 음소거는 연습 흐름을 막지 않고 네 종류 피드백을 구분한다', async () => {
  assert.equal(FEEDBACK_TONES['stroke-success'].length, 1)
  assert.equal(FEEDBACK_TONES.retry.length, 1)
  assert.equal(FEEDBACK_TONES['character-complete'].length, 2)
  assert.equal(FEEDBACK_TONES['session-complete'].length, 3)
  const controller = createAudioFeedbackController(false, () => { throw new Error('AudioContext unavailable') })
  assert.equal(await controller.unlock(), false)
  assert.doesNotThrow(() => controller.play('stroke-success'))
  controller.setMuted(true)
  assert.equal(controller.isMuted(), true)
  controller.dispose()
})

test('점수 UI와 채점 모듈은 제거되고 포인터 자동 판정·기존 인쇄 기능은 남아 있다', () => {
  const page = fs.readFileSync('src/pages/PracticePage.tsx', 'utf8')
  const canvas = fs.readFileSync('src/components/PracticeCanvas.tsx', 'utf8')
  const practiceCss = fs.readFileSync('src/practice.css', 'utf8')
  assert.equal(fs.existsSync('src/practice/scoring.ts'), false)
  assert.equal(fs.existsSync('src/practice/feedback.ts'), false)
  assert.equal(/채점하기|평균 점수|최고 점수|낮은 점수|total-score|score-button/.test(`${page}\n${practiceCss}`), false)
  assert.match(canvas, /onPointerUp=\{finishPointer\}/)
  assert.match(page, /practice-session-active/)
  assert.equal(fs.existsSync('src/components/WorksheetPreview.tsx'), true)
  assert.equal(fs.existsSync('src/utils/downloadPdf.ts'), true)
})
