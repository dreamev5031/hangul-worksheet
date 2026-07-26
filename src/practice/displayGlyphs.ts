import { decomposeHangulCharacter } from './hangulDecompose'

export const DISPLAY_GLYPH_LAYER_MARKER = 'display-glyph-layer-v1'
export const DISPLAY_GLYPH_FONT_FAMILY = '"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", "Nanum Gothic", sans-serif'

export interface DisplayGlyphBox {
  x: number
  y: number
  width: number
  height: number
}

export interface DisplayGlyphDescriptor {
  character: string
  kind: 'syllable' | 'jamo'
  box: DisplayGlyphBox
  scaleX: number
  scaleY: number
  offsetX: number
  offsetY: number
  fontWeight: 600 | 700
}

export interface DisplayGlyphBounds extends DisplayGlyphBox {
  right: number
  bottom: number
}

interface GlyphTuning {
  box?: DisplayGlyphBox
  scaleX?: number
  scaleY?: number
  offsetX?: number
  offsetY?: number
  fontWeight?: 600 | 700
}

const SYLLABLE_BOX: DisplayGlyphBox = { x: 0.06, y: 0.06, width: 0.88, height: 0.88 }
const JAMO_BOX: DisplayGlyphBox = { x: 0.08, y: 0.08, width: 0.84, height: 0.84 }

// 호환 자모는 표시 레이어에만 작은 광학 보정을 적용합니다.
// 판정용 획 좌표와 허용 범위는 이 데이터에 의존하지 않습니다.
const JAMO_TUNING: Record<string, GlyphTuning> = {
  'ㅎ': { box: { x: 0.09, y: 0.045, width: 0.82, height: 0.91 }, scaleX: 1.01, scaleY: 1.01, offsetY: -0.004, fontWeight: 700 },
  'ㅇ': { box: { x: 0.09, y: 0.08, width: 0.82, height: 0.84 }, scaleX: 1.03, scaleY: 1.03, fontWeight: 700 },
  'ㅅ': { box: { x: 0.07, y: 0.08, width: 0.86, height: 0.84 }, scaleX: 1.03, scaleY: 1.01, offsetY: 0.008, fontWeight: 700 },
  'ㅈ': { box: { x: 0.07, y: 0.07, width: 0.86, height: 0.86 }, scaleX: 1.02, scaleY: 1.01, fontWeight: 700 },
  'ㅊ': { box: { x: 0.07, y: 0.045, width: 0.86, height: 0.91 }, scaleX: 1.02, scaleY: 1.01, offsetY: -0.004, fontWeight: 700 },
  'ㅁ': { box: { x: 0.09, y: 0.08, width: 0.82, height: 0.84 }, scaleX: 0.99, scaleY: 1.01, fontWeight: 700 },
  'ㅂ': { box: { x: 0.08, y: 0.06, width: 0.84, height: 0.88 }, scaleX: 0.99, scaleY: 1.01, fontWeight: 700 },
  'ㅏ': { box: { x: 0.15, y: 0.055, width: 0.7, height: 0.89 }, scaleX: 0.94, scaleY: 1.02, fontWeight: 700 },
  'ㅓ': { box: { x: 0.15, y: 0.055, width: 0.7, height: 0.89 }, scaleX: 0.94, scaleY: 1.02, fontWeight: 700 },
  'ㅗ': { box: { x: 0.07, y: 0.14, width: 0.86, height: 0.72 }, scaleX: 1.02, scaleY: 0.98, offsetY: -0.006, fontWeight: 700 },
  'ㅜ': { box: { x: 0.07, y: 0.14, width: 0.86, height: 0.72 }, scaleX: 1.02, scaleY: 0.98, offsetY: 0.006, fontWeight: 700 },
  'ㅡ': { box: { x: 0.06, y: 0.22, width: 0.88, height: 0.56 }, scaleX: 1.03, scaleY: 0.96, fontWeight: 700 },
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function getDisplayGlyphDescriptor(character: string): DisplayGlyphDescriptor {
  const decomposition = decomposeHangulCharacter(character)
  const kind = decomposition.kind === 'jamo' ? 'jamo' : 'syllable'
  const tuning = kind === 'jamo' ? JAMO_TUNING[character] ?? {} : {}
  return {
    character,
    kind,
    box: tuning.box ?? (kind === 'jamo' ? JAMO_BOX : SYLLABLE_BOX),
    scaleX: tuning.scaleX ?? 1,
    scaleY: tuning.scaleY ?? 1,
    offsetX: tuning.offsetX ?? 0,
    offsetY: tuning.offsetY ?? 0,
    fontWeight: tuning.fontWeight ?? (kind === 'jamo' ? 700 : 600),
  }
}

export function getDisplayGlyphBounds(descriptor: DisplayGlyphDescriptor): DisplayGlyphBounds {
  const centerX = descriptor.box.x + descriptor.box.width / 2 + descriptor.offsetX * descriptor.box.width
  const centerY = descriptor.box.y + descriptor.box.height / 2 + descriptor.offsetY * descriptor.box.height
  const width = descriptor.box.width * descriptor.scaleX
  const height = descriptor.box.height * descriptor.scaleY
  const x = centerX - width / 2
  const y = centerY - height / 2
  return { x, y, width, height, right: x + width, bottom: y + height }
}

export function isDisplayGlyphInBounds(descriptor: DisplayGlyphDescriptor): boolean {
  const bounds = getDisplayGlyphBounds(descriptor)
  return [bounds.x, bounds.y, bounds.width, bounds.height, bounds.right, bounds.bottom].every(Number.isFinite)
    && bounds.x >= 0
    && bounds.y >= 0
    && bounds.right <= 1
    && bounds.bottom <= 1
    && bounds.width > 0
    && bounds.height > 0
}

export function drawDisplayGlyph(
  context: CanvasRenderingContext2D,
  character: string,
  width: number,
  height: number,
  options: { color?: string; alpha?: number } = {},
): void {
  if (!character || width <= 0 || height <= 0) return
  const descriptor = getDisplayGlyphDescriptor(character)
  const side = Math.min(width, height)
  const targetWidth = descriptor.box.width * width / descriptor.scaleX
  const targetHeight = descriptor.box.height * height / descriptor.scaleY
  const fontSize = clamp(
    Math.min(targetWidth * 0.96, targetHeight * 0.92),
    side * 0.34,
    side * 0.84,
  )
  const centerX = (descriptor.box.x + descriptor.box.width / 2 + descriptor.offsetX * descriptor.box.width) * width
  const centerY = (descriptor.box.y + descriptor.box.height / 2 + descriptor.offsetY * descriptor.box.height) * height

  context.save()
  context.globalAlpha = options.alpha ?? 0.17
  context.fillStyle = options.color ?? '#adc5bb'
  context.font = `${descriptor.fontWeight} ${fontSize}px ${DISPLAY_GLYPH_FONT_FAMILY}`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.translate(centerX, centerY)
  context.scale(descriptor.scaleX, descriptor.scaleY)
  context.fillText(character, 0, 0, targetWidth)
  context.restore()
}
