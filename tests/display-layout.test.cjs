const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

const { INITIALS, MEDIALS, FINALS } = require('../.test-dist/hangulDecompose.js')
const {
  generateCharacterStrokes,
  getGeneratedComponentBounds,
  isGeneratedCharacterInBounds,
} = require('../.test-dist/syllableLayout.js')
const { pointToPolylineDistance } = require('../.test-dist/strokePath.js')
const { validateStroke } = require('../.test-dist/strokeValidator.js')
const {
  CANONICAL_STROKE_RENDERING_MARKER,
  getCanonicalStrokeLayers,
} = require('../.test-dist/canonicalStrokeRendering.js')
const {
  INITIAL_STROKE_STANDARD,
  MEDIAL_STROKE_STANDARD,
  FINAL_STROKE_STANDARD,
  STROKE_STANDARD_VERSION,
} = require('../.test-dist/strokeStandard.js')
const { calculatePracticeLayout } = require('../.test-dist/layout.js')

const REPRESENTATIVE = ['ㄷ', '다', '바', '밤', '황', '슬', '김', '민', '준', '가', '과', '물', '한']

function minimumDistance(strokesA, strokesB) {
  let minimum = Number.POSITIVE_INFINITY
  for (const strokeA of strokesA) {
    for (const point of strokeA.guidePoints) {
      for (const strokeB of strokesB) {
        minimum = Math.min(minimum, pointToPolylineDistance(point, strokeB.guidePoints))
      }
    }
  }
  return minimum
}

function getRoleStrokes(character, role) {
  return character.strokes.filter((stroke) => stroke.id.startsWith(`${role}-`))
}

test('유아용 획순 표준은 초성 19개·중성 21개·모든 받침 획수를 고정한다', () => {
  assert.equal(STROKE_STANDARD_VERSION, 'canonical-kids-v2-2026-07')
  assert.equal(Object.keys(INITIAL_STROKE_STANDARD).length, 19)
  assert.equal(Object.keys(MEDIAL_STROKE_STANDARD).length, 21)
  assert.equal(Object.keys(FINAL_STROKE_STANDARD).length, 27)

  for (const jamo of INITIALS) {
    const generated = generateCharacterStrokes(jamo)
    assert.ok(generated, `초성 생성 실패: ${jamo}`)
    assert.equal(generated.strokes.length, INITIAL_STROKE_STANDARD[jamo].strokeCount, `초성 획수 불일치: ${jamo}`)
  }
  for (const jamo of MEDIALS) {
    const generated = generateCharacterStrokes(jamo)
    assert.ok(generated, `중성 생성 실패: ${jamo}`)
    assert.equal(generated.strokes.length, MEDIAL_STROKE_STANDARD[jamo].strokeCount, `중성 획수 불일치: ${jamo}`)
  }
  for (const jamo of FINALS.filter(Boolean)) {
    const generated = generateCharacterStrokes(jamo)
    assert.ok(generated, `종성 생성 실패: ${jamo}`)
    assert.equal(generated.strokes.length, FINAL_STROKE_STANDARD[jamo].strokeCount, `종성 획수 불일치: ${jamo}`)
  }
})

test('ㄷ은 2획이고 두 번째 획은 세로 후 오른쪽으로 꺾이는 연속 polyline이다', () => {
  const digeut = generateCharacterStrokes('ㄷ')
  const da = generateCharacterStrokes('다')
  assert.equal(digeut.strokes.length, 2)
  assert.equal(da.strokes.length, 4)

  const second = digeut.strokes[1]
  assert.equal(second.pathKind, 'polyline')
  assert.ok(second.points.length >= 3)
  assert.equal(second.waypoints.length, 1)
  const [start, corner, end] = second.points
  assert.ok(corner.y - start.y > Math.abs(corner.x - start.x), '첫 구간은 아래 방향이어야 함')
  assert.ok(end.x - corner.x > Math.abs(end.y - corner.y), '둘째 구간은 오른쪽 방향이어야 함')

  assert.equal(validateStroke(second.guidePoints, second).accepted, true)
  assert.equal(validateStroke([start, corner], second).accepted, false, '세로선만 쓰면 실패해야 함')
  assert.equal(validateStroke([corner, end], second).accepted, false, '아래 가로선만 쓰면 실패해야 함')
  const diagonal = [start, { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }, end]
  assert.equal(validateStroke(diagonal, second).accepted, false, '꺾임을 지나지 않는 대각선은 실패해야 함')
})

test('흐린 전체 글자·현재 획·완료 획·판정은 동일 canonical StrokePath 객체를 공유한다', () => {
  for (const sample of REPRESENTATIVE) {
    const generated = generateCharacterStrokes(sample)
    assert.ok(generated)
    const layers = getCanonicalStrokeLayers(generated, 1, 1)
    assert.equal(layers.background, generated.strokes)
    assert.equal(layers.background[0], generated.strokes[0])
    if (generated.strokes[1]) assert.equal(layers.current, generated.strokes[1])
    if (layers.completed[0]) assert.equal(layers.completed[0], generated.strokes[0])
  }
  assert.equal(CANONICAL_STROKE_RENDERING_MARKER, 'canonical-stroke-rendering-v2')
})

test('시스템 폰트 완성 글자 레이어와 표시·판정 분리 구조가 제거됐다', () => {
  const canvas = fs.readFileSync('src/components/PracticeCanvas.tsx', 'utf8')
  const validator = fs.readFileSync('src/practice/strokeValidator.ts', 'utf8')
  assert.equal(fs.existsSync('src/practice/displayGlyphs.ts'), false)
  assert.doesNotMatch(canvas, /drawDisplayGlyph|DISPLAY_GLYPH_FONT_FAMILY|data-display-glyph-layer/)
  assert.doesNotMatch(canvas, /fillText\(character|fillText\(character\.character/)
  assert.match(canvas, /layers\.background\.forEach/)
  assert.match(canvas, /currentStroke\.guidePoints/)
  assert.match(canvas, /data-canonical-stroke-source=\{CANONICAL_STROKE_RENDERING_MARKER\}/)
  assert.doesNotMatch(validator, /displayGlyph|font|fillText/)
})

test('대표 글자의 모든 canonical 획은 캔버스 안에 있고 자모 영역이 침범하지 않는다', () => {
  for (const sample of REPRESENTATIVE) {
    const generated = generateCharacterStrokes(sample)
    assert.ok(generated, `생성 실패: ${sample}`)
    assert.equal(isGeneratedCharacterInBounds(generated), true, `경계 이탈: ${sample}`)
    for (const stroke of generated.strokes) {
      assert.ok(stroke.guidePoints.length >= 2, `빈 안내 경로: ${sample}/${stroke.id}`)
      assert.ok(stroke.guidePoints.every((point) => point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1))
    }
  }

  for (const sample of ['다', '바', '밤', '김', '민', '한']) {
    const generated = generateCharacterStrokes(sample)
    const initial = getRoleStrokes(generated, 'initial')
    const medial = getRoleStrokes(generated, 'medial')
    assert.ok(minimumDistance(initial, medial) >= 0.018, `${sample} 초성·중성 침범`)
    if (generated.final) {
      const final = getRoleStrokes(generated, 'final')
      assert.ok(minimumDistance(initial, final) >= 0.055, `${sample} 초성·종성 침범`)
      assert.ok(minimumDistance(medial, final) >= 0.055, `${sample} 중성·종성 침범`)
      const bounds = getGeneratedComponentBounds(generated)
      assert.ok(bounds.final.y > Math.max(bounds.initial.y + bounds.initial.height, bounds.medial.y + bounds.medial.height), `${sample} 받침 위치 오류`)
    }
  }

  const bamBounds = getGeneratedComponentBounds(generateCharacterStrokes('밤')).final
  assert.ok(bamBounds.width / bamBounds.height <= 1.15, `밤 받침 ㅁ이 가로로 퍼짐: ${bamBounds.width / bamBounds.height}`)
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

test('태블릿 가로 화면은 큰 캔버스와 240~340px 보조 패널을 유지한다', () => {
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
  assert.ok(calculatePracticeLayout({ width: 1536, height: 960 }).canvasSide > 720)
})

test('세로 화면과 가로 UI 구조의 기존 장점을 유지한다', () => {
  const portraitViewports = [[360, 740], [390, 844], [412, 915], [768, 1024], [800, 1200]]
  for (const [width, height] of portraitViewports) {
    const metrics = calculatePracticeLayout({ width, height })
    assert.equal(metrics.mode, 'portrait', `${width}x${height} 세로 모드 오류`)
    assert.equal(metrics.panelWidth, 0)
    assert.ok(metrics.canvasSide <= 720)
  }

  const page = fs.readFileSync('src/pages/PracticePage.tsx', 'utf8')
  const css = fs.readFileSync('src/practice.css', 'utf8')
  const sidePanel = fs.readFileSync('src/components/PracticeSidePanel.tsx', 'utf8')
  assert.match(page, /className={`practice-session-shell layout-\$\{layout\.mode\}`}/)
  assert.match(page, /visualViewport\?\.addEventListener\('scroll'/)
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\) var\(--practice-panel-width\)/)
  assert.match(sidePanel, /현재 \{currentStrokeIndex \+ 1\} \/ \{totalStrokes\}획/)
  assert.match(sidePanel, /현재 글자 처음부터/)
  assert.match(sidePanel, /획 안내 다시 보기/)
})
