const test = require('node:test')
const assert = require('node:assert/strict')

const { parsePracticeItems } = require('../.test-dist/parser.js')
const { buildPracticeFeedback } = require('../.test-dist/feedback.js')
const { calculateScoreFromMetrics } = require('../.test-dist/scoring.js')
const storage = require('../.test-dist/storage.js')
const session = require('../.test-dist/session.js')

class MemoryStorage {
  constructor() { this.data = new Map() }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null }
  setItem(key, value) { this.data.set(key, String(value)) }
  removeItem(key) { this.data.delete(key) }
  clear() { this.data.clear() }
}

global.localStorage = new MemoryStorage()
global.sessionStorage = new MemoryStorage()

function metrics(overrides = {}) {
  return {
    precision: 0.9,
    coverage: 0.88,
    f1: 0.89,
    centerOffsetX: 0.01,
    centerOffsetY: -0.01,
    sizeRatio: 1.02,
    userAreaRatio: 1.1,
    jitter: 0.08,
    strokeCount: 4,
    pointCount: 80,
    ...overrides,
  }
}

test('한 글자씩 모드는 한글 음절·자모를 분리하고 공백·중복을 제거한다', () => {
  assert.deepEqual(parsePracticeItems('ㄱ\n가\n사과\n김민준\n가', 'character').items, ['ㄱ', '가', '사', '과', '김', '민', '준'])
})

test('Intl.Segmenter로 이모지·영문·숫자를 깨뜨리지 않는다', () => {
  assert.deepEqual(parsePracticeItems('👨‍👩‍👧‍👦, A, 1', 'character').items, ['👨‍👩‍👧‍👦', 'A', '1'])
})

test('입력한 줄 그대로 모드는 줄과 쉼표 단위를 유지한다', () => {
  assert.deepEqual(parsePracticeItems('사과, 김민준\nhello world\n\n사과', 'line').items, ['사과', '김민준', 'hello world'])
})

test('10개 초과 입력은 앞의 10개만 사용하고 안내 상태를 반환한다', () => {
  const parsed = parsePracticeItems('가나다라마바사아자차카', 'character')
  assert.equal(parsed.items.length, 10)
  assert.equal(parsed.totalBeforeLimit, 11)
  assert.equal(parsed.truncated, true)
})

test('빈 입력은 연습 항목을 만들지 않는다', () => {
  assert.deepEqual(parsePracticeItems(' , \n ', 'character').items, [])
})

test('정상적인 따라쓰기는 높은 점수, 전체 칠하기와 한 점 입력은 낮은 점수다', () => {
  const good = calculateScoreFromMetrics(metrics())
  const scribble = calculateScoreFromMetrics(metrics({ precision: 0.12, coverage: 0.96, f1: 0.21, userAreaRatio: 8.5, jitter: 0.85, pointCount: 250 }))
  const dot = calculateScoreFromMetrics(metrics({ precision: 0.92, coverage: 0.04, f1: 0.077, sizeRatio: 0.12, userAreaRatio: 0.03, pointCount: 1, strokeCount: 1 }))
  assert.ok(good.total >= 85, `good=${good.total}`)
  assert.ok(scribble.total < 45, `scribble=${scribble.total}`)
  assert.ok(dot.total < 35, `dot=${dot.total}`)
  assert.ok(good.total > scribble.total)
})

test('정확도 또는 커버리지 한쪽만 높은 경우 조화평균 때문에 고득점하지 않는다', () => {
  const unbalanced = calculateScoreFromMetrics(metrics({ precision: 0.96, coverage: 0.18, f1: 2 * 0.96 * 0.18 / (0.96 + 0.18) }))
  assert.ok(unbalanced.shape < 20, `shape=${unbalanced.shape}`)
  assert.ok(unbalanced.total < 65, `total=${unbalanced.total}`)
})

test('피드백은 친화적 문장 최대 2개만 반환한다', () => {
  const feedback = buildPracticeFeedback(40, metrics({ centerOffsetX: 0.2, sizeRatio: 0.5, coverage: 0.2, precision: 0.2, jitter: 0.9 }))
  assert.equal(feedback.length, 2)
  assert.ok(feedback.every((message) => !/실패|못했|틀렸/.test(message)))
})

test('연습 기록은 점수 정보만 저장하고 삭제 후 사라진다', () => {
  localStorage.clear()
  const result = {
    item: '가', firstScore: 55, bestScore: 82, attempts: 3,
    bestBreakdown: calculateScoreFromMetrics(metrics()),
  }
  const record = storage.createSessionRecord([result])
  storage.savePracticeSession(record)
  const loaded = storage.loadPracticeRecords()
  assert.equal(loaded.length, 1)
  assert.equal(loaded[0].items[0].bestScore, 82)
  const serialized = JSON.stringify(loaded)
  assert.equal(serialized.includes('points'), false)
  assert.equal(serialized.includes('image'), false)
  storage.deletePracticeRecords()
  assert.deepEqual(storage.loadPracticeRecords(), [])
})

test('세션 설정은 유효한 값만 복원한다', () => {
  sessionStorage.clear()
  const config = { rawText: '사과', displayMode: 'faint', progressMode: 'character' }
  session.savePracticeConfig(config)
  assert.deepEqual(session.loadPracticeConfig(), config)
  sessionStorage.setItem(session.PRACTICE_CONFIG_KEY, JSON.stringify({ rawText: '가', displayMode: 'bad', progressMode: 'character' }))
  assert.equal(session.loadPracticeConfig(), null)
})
