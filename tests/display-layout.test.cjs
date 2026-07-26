const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

const {
  DISPLAY_GLYPH_LAYER_MARKER,
  DISPLAY_GLYPH_FONT_FAMILY,
  getDisplayGlyphDescriptor,
  getDisplayGlyphBounds,
  isDisplayGlyphInBounds,
} = require('../.test-dist/displayGlyphs.js')
const { calculatePracticeLayout } = require('../.test-dist/layout.js')

const DISPLAY_SAMPLES = ['ㄱ', '가', '사', '황', '슬', '김', '민', '준', '하', '호', '우', '히']
const FOCUS_JAMO = ['ㅎ', 'ㅇ', 'ㅅ', 'ㅈ', 'ㅊ', 'ㅁ', 'ㅂ', 'ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ']

function assertDescriptor(character) {
  const descriptor = getDisplayGlyphDescriptor(character)
  const bounds = getDisplayGlyphBounds(descriptor)
  assert.equal(isDisplayGlyphInBounds(descriptor), true, `${character} 표시 glyph가 캔버스 범위를 벗어남`)
  assert.ok(bounds.x >= 0 && bounds.y >= 0, `${character} 시작 좌표 오류`)
  assert.ok(bounds.right <= 1 && bounds.bottom <= 1, `${character} 끝 좌표 오류`)
  assert.ok(bounds.width >= 0.42 && bounds.height >= 0.4, `${character} 표시 glyph가 지나치게 작음`)
  return descriptor
}

test('표시 품질 확인용 주요 글자는 모두 독립된 정자체 glyph 영역을 생성한다', () => {
  for (const character of DISPLAY_SAMPLES) assertDescriptor(character)
  assert.match(DISPLAY_GLYPH_FONT_FAMILY, /Noto Sans KR/)
  assert.match(DISPLAY_GLYPH_FONT_FAMILY, /Malgun Gothic/)
  assert.equal(DISPLAY_GLYPH_LAYER_MARKER, 'display-glyph-layer-v1')
})

test('중점 보정 자모는 자모용 광학 보정과 안전한 경계를 사용한다', () => {
  for (const character of FOCUS_JAMO) {
    const descriptor = assertDescriptor(character)
    assert.equal(descriptor.kind, 'jamo', `${character} 자모 분류 오류`)
    assert.ok(descriptor.fontWeight >= 600)
  }
  const ieung = getDisplayGlyphDescriptor('ㅇ')
  const hieuh = getDisplayGlyphDescriptor('ㅎ')
  const a = getDisplayGlyphDescriptor('ㅏ')
  const o = getDisplayGlyphDescriptor('ㅗ')
  assert.ok(ieung.scaleX >= 1 && ieung.scaleY >= 1, 'ㅇ 원형감 보정 누락')
  assert.ok(hieuh.box.height > hieuh.box.width, 'ㅎ 상하 관계를 위한 높이 확보 누락')
  assert.ok(a.box.height > a.box.width, 'ㅏ 세로 비율 보정 누락')
  assert.ok(o.box.width > o.box.height, 'ㅗ 가로 비율 보정 누락')
})

test('표시용 글자는 판정용 획보다 먼저 별도 레이어로 렌더링된다', () => {
  const canvas = fs.readFileSync('src/components/PracticeCanvas.tsx', 'utf8')
  const displayModule = fs.readFileSync('src/practice/displayGlyphs.ts', 'utf8')
  const validator = fs.readFileSync('src/practice/strokeValidator.ts', 'utf8')
  assert.ok(canvas.indexOf('drawDisplayGlyph(') < canvas.indexOf('character.strokes.forEach'))
  assert.match(canvas, /data-display-glyph-layer=\{DISPLAY_GLYPH_LAYER_MARKER\}/)
  assert.doesNotMatch(displayModule, /strokeValidator|validateStroke/)
  assert.doesNotMatch(validator, /displayGlyph/)
})

test('휴대폰 가로 화면은 높이를 최대한 쓰는 압축 2열 레이아웃이다', () => {
  const viewports = [[740, 360], [844, 390], [915, 412]]
  for (const [width, height] of viewports) {
    const metrics = calculatePracticeLayout({ width, height })
    assert.equal(metrics.mode, 'phone-landscape', `${width}x${height} 모드 오류`)
    assert.ok(metrics.canvasSide >= height - 70, `${width}x${height} 캔버스 높이 활용 부족: ${metrics.canvasSide}`)
    assert.ok(metrics.panelWidth >= 168 && metrics.panelWidth <= 216)
    assert.ok(metrics.canvasSide <= metrics.availableWidth)
    assert.ok(metrics.canvasSide <= metrics.availableHeight)
  }
})

test('태블릿 가로 화면은 큰 캔버스와 240~340px 보조 패널을 사용한다', () => {
  const viewports = [
    [1024, 600], [1024, 768], [1180, 820], [1200, 800], [1280, 800], [1366, 768], [1536, 960],
  ]
  for (const [width, height] of viewports) {
    const metrics = calculatePracticeLayout({ width, height })
    assert.equal(metrics.mode, 'tablet-landscape', `${width}x${height} 모드 오류`)
    assert.ok(metrics.panelWidth >= 240 && metrics.panelWidth <= 340, `${width}x${height} 패널 폭 오류`)
    assert.ok(metrics.canvasSide >= Math.min(metrics.availableWidth, metrics.availableHeight) - 1)
    assert.ok(metrics.canvasSide <= 960)
  }
  assert.ok(calculatePracticeLayout({ width: 1536, height: 960 }).canvasSide > 720, '큰 태블릿의 720px 제한이 남아 있음')
})

test('세로 화면은 기존 상단·캔버스·하단 집중 모드를 유지한다', () => {
  const viewports = [[360, 740], [390, 844], [412, 915], [768, 1024], [800, 1200]]
  for (const [width, height] of viewports) {
    const metrics = calculatePracticeLayout({ width, height })
    assert.equal(metrics.mode, 'portrait', `${width}x${height} 세로 모드 오류`)
    assert.equal(metrics.panelWidth, 0)
    assert.ok(metrics.canvasSide <= 720)
  }
})

test('가로 UI는 캔버스 제목 중복과 전체 너비 하단 바를 숨기고 우측 패널을 사용한다', () => {
  const page = fs.readFileSync('src/pages/PracticePage.tsx', 'utf8')
  const css = fs.readFileSync('src/practice.css', 'utf8')
  const sidePanel = fs.readFileSync('src/components/PracticeSidePanel.tsx', 'utf8')
  assert.match(page, /className={`practice-session-shell layout-\$\{layout\.mode\}`}/)
  assert.match(page, /data-scroll-ok=\{scrollOk\}/)
  assert.match(page, /visualViewport\?\.addEventListener\('scroll'/)
  assert.match(css, /\.layout-tablet-landscape \.practice-session-main/)
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\) var\(--practice-panel-width\)/)
  assert.match(css, /\.layout-tablet-landscape \.practice-portrait-controls/)
  assert.match(sidePanel, /현재 \{currentStrokeIndex \+ 1\} \/ \{totalStrokes\}획/)
  assert.match(sidePanel, /현재 글자 처음부터/)
  assert.match(sidePanel, /획 안내 다시 보기/)
})
