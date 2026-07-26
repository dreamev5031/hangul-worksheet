const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

const { INITIALS, MEDIALS, FINALS } = require('../.test-dist/hangulDecompose.js')
const {
  generateCharacterStrokes,
  generateCharacterStrokeStages,
  getGeneratedComponentBounds,
  isGeneratedCharacterInBounds,
} = require('../.test-dist/syllableLayout.js')
const {
  getGlyphCenterOffset,
  getStrokeBounds,
  isGlyphInUnitBounds,
} = require('../.test-dist/glyphFit.js')
const { getGlyphQualityMetrics } = require('../.test-dist/glyphQuality.js')
const {
  applyOpticalAdjustmentToBox,
  getOpticalAdjustment,
} = require('../.test-dist/opticalAdjustments.js')
const {
  getAllBaseLayoutTemplates,
  getSyllableLayoutTemplate,
  getSyllableLayoutType,
} = require('../.test-dist/syllableLayoutTemplates.js')
const { SYLLABLE_OVERRIDES } = require('../.test-dist/syllableOverrides.js')
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

const REPRESENTATIVE = ['ㄷ', '다', '바', '밤', '황', '슬', '김', '민', '준', '가', '과', '물', '한', '읽', '값', '뿔']
const QUALITY_SYLLABLES = ['가', '다', '바', '밤', '황', '슬', '김', '민', '준', '과', '물', '한', '읽', '값']

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

function serializedGeometry(strokes) {
  return strokes.map((stroke) => ({
    id: stroke.id,
    points: stroke.points.map((point) => [Number(point.x.toFixed(5)), Number(point.y.toFixed(5))]),
  }))
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

test('음절 유형 6종과 겹받침 좌우 박스는 정규화 데이터로 고정된다', () => {
  const templates = getAllBaseLayoutTemplates()
  assert.equal(templates.length, 6)
  assert.equal(getSyllableLayoutType('ㅏ', false), 'vertical-no-final')
  assert.equal(getSyllableLayoutType('ㅏ', true), 'vertical-with-final')
  assert.equal(getSyllableLayoutType('ㅜ', false), 'horizontal-no-final')
  assert.equal(getSyllableLayoutType('ㅜ', true), 'horizontal-with-final')
  assert.equal(getSyllableLayoutType('ㅘ', false), 'compound-no-final')
  assert.equal(getSyllableLayoutType('ㅘ', true), 'compound-with-final')

  for (const template of templates) {
    const boxes = [template.initial, ...template.medial, template.final, ...(template.clusterFinal ?? []), template.target].filter(Boolean)
    for (const box of boxes) {
      assert.ok(box.x >= 0 && box.y >= 0)
      assert.ok(box.width > 0 && box.height > 0)
      assert.ok(box.x + box.width <= 1)
      assert.ok(box.y + box.height <= 1)
    }
    if (template.type.endsWith('with-final')) {
      assert.ok(template.final)
      assert.equal(template.clusterFinal.length, 2)
    }
  }

  const topCompound = getSyllableLayoutTemplate('ㅘ', true)
  const bottomCompound = getSyllableLayoutTemplate('ㅝ', true)
  assert.notDeepEqual(topCompound.medial, bottomCompound.medial)
})

test('자모 광학 보정은 역할별 박스를 데이터 테이블로 조정한다', () => {
  const initialBox = { x: 0.14, y: 0.09, width: 0.33, height: 0.47 }
  const finalBox = { x: 0.27, y: 0.65, width: 0.46, height: 0.27 }
  const bAdjustment = getOpticalAdjustment('ㅂ', 'initial', 'vertical-with-final')
  const mAdjustment = getOpticalAdjustment('ㅁ', 'final', 'vertical-with-final')
  const adjustedB = applyOpticalAdjustmentToBox(initialBox, bAdjustment)
  const adjustedM = applyOpticalAdjustmentToBox(finalBox, mAdjustment)
  assert.ok(adjustedB.width < initialBox.width, '초성 ㅂ 폭 축소가 적용되지 않음')
  assert.ok(adjustedB.height < initialBox.height, '초성 ㅂ 높이 축소가 적용되지 않음')
  assert.ok(adjustedM.width > finalBox.width, '받침 ㅁ 확대가 적용되지 않음')
  assert.ok(adjustedM.y < finalBox.y, '받침 ㅁ 위쪽 이동이 적용되지 않음')
})

test('완성 글자 자동 fit은 aspect ratio를 유지하며 목표 영역 중앙으로 이동한다', () => {
  for (const sample of QUALITY_SYLLABLES) {
    const stages = generateCharacterStrokeStages(sample)
    assert.ok(stages, `단계 생성 실패: ${sample}`)
    assert.ok(stages.beforeFitBounds)
    assert.ok(stages.fitMetadata)
    const { before, after, target, scale, usageX, usageY } = stages.fitMetadata
    assert.ok(scale > 0)
    assert.ok(isGlyphInUnitBounds(after), `${sample} fit 후 범위 이탈`)
    assert.ok(getGlyphCenterOffset(after) <= 0.002, `${sample} 중앙 정렬 실패`)
    assert.ok(Math.max(usageX, usageY) >= 0.995, `${sample} 목표 영역 활용 부족`)
    assert.ok(after.x >= target.x - 0.0001 && after.y >= target.y - 0.0001)
    assert.ok(after.right <= target.right + 0.0001 && after.bottom <= target.bottom + 0.0001)
    const beforeRatio = before.height > 0 ? before.width / before.height : 0
    const afterRatio = after.height > 0 ? after.width / after.height : 0
    assert.ok(Math.abs(beforeRatio - afterRatio) <= 0.0001, `${sample} fit 비율 왜곡`)
  }
})

test('선별 완성형 override는 획순·개수·ID를 바꾸지 않고 좌표 메타데이터만 보정한다', () => {
  const overrideKeys = Object.keys(SYLLABLE_OVERRIDES)
  assert.deepEqual(overrideKeys.sort(), ['과', '김', '민', '물', '밤', '슬', '준', '한', '황'].sort())
  assert.ok(overrideKeys.length < 20, 'override가 과도하게 증가함')

  for (const character of overrideKeys) {
    const withoutOverride = generateCharacterStrokeStages(character, { applyOverride: false, applyFit: false })
    const withOverride = generateCharacterStrokeStages(character, { applyOverride: true, applyFit: false })
    const final = generateCharacterStrokes(character)
    assert.ok(withoutOverride && withOverride && final)
    assert.equal(withOverride.overrideApplied, true)
    assert.equal(withoutOverride.character.strokes.length, withOverride.character.strokes.length)
    assert.deepEqual(
      withoutOverride.character.strokes.map((stroke) => stroke.id),
      withOverride.character.strokes.map((stroke) => stroke.id),
      `${character} override가 획 순서를 변경함`,
    )
    assert.notDeepEqual(serializedGeometry(withoutOverride.overriddenStrokes), serializedGeometry(withOverride.overriddenStrokes), `${character} override 미적용`)
    assert.equal(isGeneratedCharacterInBounds(final), true)
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

test('흐린 전체 글자·현재 획·완료 획·판정은 최종 fit된 동일 canonical StrokePath 객체를 공유한다', () => {
  for (const sample of REPRESENTATIVE) {
    const generated = generateCharacterStrokes(sample)
    assert.ok(generated)
    const layers = getCanonicalStrokeLayers(generated, 1, 1)
    assert.equal(layers.background, generated.strokes)
    assert.equal(layers.background[0], generated.strokes[0])
    if (generated.strokes[1]) assert.equal(layers.current, generated.strokes[1])
    if (layers.completed[0]) assert.equal(layers.completed[0], generated.strokes[0])
  }
  assert.equal(CANONICAL_STROKE_RENDERING_MARKER, 'canonical-stroke-rendering-v3-optical-fit')
})

test('시스템 폰트 완성 글자 레이어와 표시·판정 분리 구조는 다시 추가되지 않았다', () => {
  const canvas = fs.readFileSync('src/components/PracticeCanvas.tsx', 'utf8')
  const validator = fs.readFileSync('src/practice/strokeValidator.ts', 'utf8')
  assert.equal(fs.existsSync('src/practice/displayGlyphs.ts'), false)
  assert.doesNotMatch(canvas, /drawDisplayGlyph|DISPLAY_GLYPH_FONT_FAMILY|data-display-glyph-layer/)
  assert.doesNotMatch(canvas, /fillText\(character|fillText\(character\.character/)
  assert.match(canvas, /layers\.background\.forEach/)
  assert.match(canvas, /currentStroke\.guidePoints/)
  assert.match(canvas, /data-glyph-fit-scale/)
  assert.match(canvas, /data-canonical-stroke-source=\{CANONICAL_STROKE_RENDERING_MARKER\}/)
  assert.doesNotMatch(validator, /displayGlyph|font|fillText/)
})

test('현대 한글 11,172음절은 optical·override·fit 후 모두 생성되고 중앙·경계가 정상이다', () => {
  let count = 0
  for (let code = 0xac00; code <= 0xd7a3; code += 1) {
    const character = String.fromCodePoint(code)
    const generated = generateCharacterStrokes(character)
    assert.ok(generated, `생성 실패: ${character}`)
    assert.equal(isGeneratedCharacterInBounds(generated), true, `좌표 범위 오류: ${character}`)
    assert.ok(generated.fit, `fit 정보 누락: ${character}`)
    assert.ok(getGlyphCenterOffset(generated.fit.after) <= 0.002, `중앙 정렬 오류: ${character}`)
    assert.ok(Math.max(generated.fit.usageX, generated.fit.usageY) >= 0.995, `목표 영역 활용 오류: ${character}`)
    assert.equal(generated.strokes.length > 0, true)
    count += 1
  }
  assert.equal(count, 11172)
})

test('대표 글자는 목표 영역을 충분히 사용하고 받침·원형·자모 비율이 합리적이다', () => {
  for (const sample of QUALITY_SYLLABLES) {
    const generated = generateCharacterStrokes(sample)
    const quality = getGlyphQualityMetrics(generated)
    assert.ok(quality, `품질 지표 생성 실패: ${sample}`)
    assert.ok(quality.centerOffset <= 0.002, `${sample} 중심 이탈`)
    assert.ok(Math.max(quality.usageX, quality.usageY) >= 0.995, `${sample} 전체 크기 부족`)
    assert.ok(Math.min(quality.usageX, quality.usageY) >= 0.38, `${sample} 지나치게 길쭉함`)
    assert.ok(quality.aspectRatio >= 0.45 && quality.aspectRatio <= 1.55, `${sample} 전체 종횡비 오류: ${quality.aspectRatio}`)
    for (const ratio of quality.closedStrokeRatios) {
      assert.ok(ratio >= 0.88 && ratio <= 1.12, `${sample} 원형 비율 오류: ${ratio}`)
    }
    if (generated.final) {
      assert.ok(quality.upperToFinalGap >= 0.018, `${sample} 위 자모와 받침 간격 부족: ${quality.upperToFinalGap}`)
      assert.ok(quality.finalToInitialWidth >= 0.42 && quality.finalToInitialWidth <= 1.35, `${sample} 받침 폭 비율 오류`)
      assert.ok(quality.finalToInitialHeight >= 0.38 && quality.finalToInitialHeight <= 1.25, `${sample} 받침 높이 비율 오류`)
    }
  }
})

test('밤·황·슬의 핵심 조형 관계가 이전의 작은 받침과 분산 배치를 방지한다', () => {
  const bam = getGlyphQualityMetrics(generateCharacterStrokes('밤'))
  const hwang = getGlyphQualityMetrics(generateCharacterStrokes('황'))
  const seul = getGlyphQualityMetrics(generateCharacterStrokes('슬'))
  assert.ok(bam.finalToInitialWidth >= 0.72 && bam.finalToInitialWidth <= 1.25)
  assert.ok(bam.finalToInitialHeight >= 0.62 && bam.finalToInitialHeight <= 1.2)
  assert.ok(bam.upperToFinalGap >= 0.025)
  assert.ok(hwang.closedStrokeRatios.every((ratio) => ratio >= 0.9 && ratio <= 1.1))
  assert.ok(hwang.roleBounds.final.width / hwang.bounds.width >= 0.22, '황 받침 ㅇ이 지나치게 작음')
  assert.ok(hwang.upperToFinalGap >= 0.02)
  assert.ok(seul.finalToInitialWidth >= 0.55, '슬 받침 ㄹ이 지나치게 작음')
})

test('대표 글자의 자모는 경계를 벗어나거나 의도치 않게 침범하지 않는다', () => {
  for (const sample of REPRESENTATIVE) {
    const generated = generateCharacterStrokes(sample)
    assert.ok(generated, `생성 실패: ${sample}`)
    assert.equal(isGeneratedCharacterInBounds(generated), true, `경계 이탈: ${sample}`)
    const bounds = getStrokeBounds(generated.strokes)
    assert.ok(isGlyphInUnitBounds(bounds))
    for (const stroke of generated.strokes) {
      assert.ok(stroke.guidePoints.length >= 2, `빈 안내 경로: ${sample}/${stroke.id}`)
    }
  }

  for (const sample of ['다', '바', '밤', '김', '민', '한']) {
    const generated = generateCharacterStrokes(sample)
    const initial = getRoleStrokes(generated, 'initial')
    const medial = getRoleStrokes(generated, 'medial')
    assert.ok(minimumDistance(initial, medial) >= 0.008, `${sample} 초성·중성 침범`)
    if (generated.final) {
      const final = getRoleStrokes(generated, 'final')
      assert.ok(minimumDistance(initial, final) >= 0.018, `${sample} 초성·종성 침범`)
      assert.ok(minimumDistance(medial, final) >= 0.018, `${sample} 중성·종성 침범`)
      const bounds = getGeneratedComponentBounds(generated)
      assert.ok(bounds.final.y > Math.max(bounds.initial.y + bounds.initial.height, bounds.medial.y + bounds.medial.height), `${sample} 받침 위치 오류`)
    }
  }
})

test('휴대폰 가로·태블릿 가로·세로 집중 레이아웃은 기존 동작을 유지한다', () => {
  for (const [width, height] of [[740, 360], [844, 390], [915, 412]]) {
    const metrics = calculatePracticeLayout({ width, height })
    assert.equal(metrics.mode, 'phone-landscape')
    assert.ok(metrics.canvasSide >= height - 70)
    assert.ok(metrics.panelWidth >= 168 && metrics.panelWidth <= 216)
  }

  for (const [width, height] of [[1024, 600], [1024, 768], [1180, 820], [1280, 800], [1536, 960]]) {
    const metrics = calculatePracticeLayout({ width, height })
    assert.equal(metrics.mode, 'tablet-landscape')
    assert.ok(metrics.panelWidth >= 240 && metrics.panelWidth <= 340)
    assert.ok(metrics.canvasSide <= 960)
  }

  for (const [width, height] of [[360, 740], [390, 844], [412, 915], [768, 1024], [800, 1200]]) {
    const metrics = calculatePracticeLayout({ width, height })
    assert.equal(metrics.mode, 'portrait')
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
})
