import type { GeometryAdjustment, GlyphTargetBox } from './glyphFit'
import type { SyllableRole } from './types'

export interface SyllableOverride {
  whole?: GeometryAdjustment
  roles?: Partial<Record<SyllableRole, GeometryAdjustment>>
  fitBox?: GlyphTargetBox
}

export const SYLLABLE_OVERRIDES: Record<string, SyllableOverride> = {
  '황': {
    roles: {
      initial: { scaleX: 1.08, scaleY: 1.08, translateX: 0.006, translateY: 0.008 },
      medial: { scaleX: 0.95, scaleY: 0.95, translateX: -0.008, translateY: -0.004 },
      final: { scaleX: 1.14, scaleY: 1.14, translateY: -0.012 },
    },
    fitBox: { x: 0.13, y: 0.07, width: 0.74, height: 0.86 },
  },
  '밤': {
    roles: {
      initial: { scaleX: 0.94, scaleY: 0.96, translateX: -0.006 },
      medial: { scaleX: 0.96, scaleY: 0.98, translateX: -0.012 },
      final: { scaleX: 1.04, scaleY: 1.04, translateY: -0.004 },
    },
    fitBox: { x: 0.13, y: 0.08, width: 0.74, height: 0.84 },
  },
  '슬': {
    roles: {
      initial: { scaleX: 1.03, scaleY: 1.04, translateY: 0.004 },
      final: { scaleX: 1.1, scaleY: 1.06, translateY: -0.008 },
    },
  },
  '김': {
    roles: {
      initial: { scaleX: 1.02, scaleY: 1.02 },
      final: { scaleX: 1.12, scaleY: 1.08, translateY: -0.006 },
    },
  },
  '민': {
    roles: {
      initial: { scaleX: 0.98, scaleY: 0.99 },
      final: { scaleX: 1.08, scaleY: 1.05, translateY: -0.004 },
    },
  },
  '준': {
    roles: {
      initial: { scaleX: 0.98, scaleY: 1.01 },
      final: { scaleX: 1.08, scaleY: 1.05, translateY: -0.004 },
    },
  },
  '과': {
    roles: {
      initial: { scaleX: 1.04, scaleY: 1.04, translateX: 0.006 },
      medial: { scaleX: 0.96, scaleY: 0.96, translateX: -0.006 },
    },
  },
  '물': {
    roles: {
      initial: { scaleX: 0.98, scaleY: 0.99 },
      final: { scaleX: 1.1, scaleY: 1.06, translateY: -0.006 },
    },
  },
  '한': {
    roles: {
      initial: { scaleX: 1.06, scaleY: 1.06, translateY: 0.004 },
      medial: { translateX: -0.008 },
      final: { scaleX: 1.08, scaleY: 1.05, translateY: -0.004 },
    },
  },
}

export function getSyllableOverride(character: string): SyllableOverride | undefined {
  return SYLLABLE_OVERRIDES[character]
}
