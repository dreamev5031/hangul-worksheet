import type { GeometryAdjustment } from './glyphFit'
import type { LayoutBox } from './syllableLayoutTemplates'
import type { SyllableLayoutType, SyllableRole } from './types'

export interface OpticalAdjustment extends GeometryAdjustment {}

interface JamoOpticalRule {
  all?: OpticalAdjustment
  roles?: Partial<Record<SyllableRole, OpticalAdjustment>>
  layouts?: Partial<Record<SyllableLayoutType, OpticalAdjustment>>
  roleLayouts?: Partial<Record<SyllableRole, Partial<Record<SyllableLayoutType, OpticalAdjustment>>>>
}

const ROUND_INITIALS = new Set(['ㅇ', 'ㅎ'])

export const JAMO_OPTICAL_ADJUSTMENTS: Record<string, JamoOpticalRule> = {
  'ㄱ': { roles: { initial: { scaleX: 1.02, scaleY: 1.02 } } },
  'ㄴ': { roles: { final: { scaleX: 1.12, scaleY: 1.06, translateY: -0.006 } } },
  'ㄷ': { roles: { initial: { scaleX: 1.01, scaleY: 1.01 }, final: { scaleX: 1.08, scaleY: 1.04 } } },
  'ㄹ': { roles: { initial: { scaleX: 0.99, scaleY: 0.99 }, final: { scaleX: 1.12, scaleY: 1.08, translateY: -0.006 } } },
  'ㅁ': {
    roles: {
      initial: { scaleX: 0.97, scaleY: 0.97 },
      final: { scaleX: 1.1, scaleY: 1.08, translateY: -0.006, strokeWidthScale: 1.03 },
    },
  },
  'ㅂ': {
    roles: {
      initial: { scaleX: 0.92, scaleY: 0.95, translateX: -0.004 },
      final: { scaleX: 1.06, scaleY: 1.04 },
    },
  },
  'ㅅ': { roles: { initial: { scaleX: 1.02, scaleY: 1.04 }, final: { scaleX: 1.08, scaleY: 1.06 } } },
  'ㅇ': {
    roles: {
      initial: { scaleX: 1.03, scaleY: 1.03 },
      final: { scaleX: 1.18, scaleY: 1.18, translateY: -0.01, strokeWidthScale: 1.03 },
    },
  },
  'ㅈ': { roles: { initial: { scaleX: 0.98, scaleY: 1 }, final: { scaleX: 1.06, scaleY: 1.04 } } },
  'ㅊ': { roles: { initial: { scaleX: 1, scaleY: 1.04, translateY: 0.004 } } },
  'ㅋ': { roles: { initial: { scaleX: 1.01, scaleY: 1.01 } } },
  'ㅌ': { roles: { initial: { scaleX: 0.99, scaleY: 1 } } },
  'ㅍ': { roles: { initial: { scaleX: 0.98, scaleY: 0.98 } } },
  'ㅎ': {
    roles: {
      initial: { scaleX: 1.08, scaleY: 1.08, translateY: 0.012, strokeWidthScale: 1.03 },
      final: { scaleX: 1.08, scaleY: 1.08 },
    },
  },
  'ㅏ': {
    roles: { medial: { scaleX: 0.9, scaleY: 0.95, translateX: -0.018 } },
    roleLayouts: {
      medial: {
        'compound-no-final': { translateX: -0.008, scaleY: 0.96 },
        'compound-with-final': { translateX: -0.006, scaleY: 0.96 },
      },
    },
  },
  'ㅐ': { roles: { medial: { scaleX: 0.93, scaleY: 0.95, translateX: -0.012 } } },
  'ㅑ': { roles: { medial: { scaleX: 0.92, scaleY: 0.96, translateX: -0.014 } } },
  'ㅒ': { roles: { medial: { scaleX: 0.94, scaleY: 0.96, translateX: -0.01 } } },
  'ㅓ': {
    roles: { medial: { scaleX: 0.9, scaleY: 0.95, translateX: 0.018 } },
    roleLayouts: {
      medial: {
        'compound-no-final': { translateX: 0.008, scaleY: 0.96 },
        'compound-with-final': { translateX: 0.006, scaleY: 0.96 },
      },
    },
  },
  'ㅔ': { roles: { medial: { scaleX: 0.93, scaleY: 0.95, translateX: 0.012 } } },
  'ㅕ': { roles: { medial: { scaleX: 0.92, scaleY: 0.96, translateX: 0.014 } } },
  'ㅖ': { roles: { medial: { scaleX: 0.94, scaleY: 0.96, translateX: 0.01 } } },
  'ㅗ': { roles: { medial: { scaleX: 0.98, scaleY: 0.92, translateY: 0.004 } } },
  'ㅛ': { roles: { medial: { scaleX: 0.98, scaleY: 0.93, translateY: 0.004 } } },
  'ㅜ': { roles: { medial: { scaleX: 0.98, scaleY: 0.92, translateY: -0.004 } } },
  'ㅠ': { roles: { medial: { scaleX: 0.98, scaleY: 0.93, translateY: -0.004 } } },
  'ㅡ': { roles: { medial: { scaleX: 0.98, scaleY: 0.86 } } },
  'ㅣ': { roles: { medial: { scaleX: 0.9, scaleY: 0.98 } } },
}

export function mergeOpticalAdjustments(...adjustments: Array<OpticalAdjustment | undefined>): OpticalAdjustment {
  return adjustments.reduce<OpticalAdjustment>((result, adjustment) => {
    if (!adjustment) return result
    return {
      scaleX: (result.scaleX ?? 1) * (adjustment.scaleX ?? 1),
      scaleY: (result.scaleY ?? 1) * (adjustment.scaleY ?? 1),
      translateX: (result.translateX ?? 0) + (adjustment.translateX ?? 0),
      translateY: (result.translateY ?? 0) + (adjustment.translateY ?? 0),
      strokeWidthScale: (result.strokeWidthScale ?? 1) * (adjustment.strokeWidthScale ?? 1),
    }
  }, {})
}

function getRoleLayoutAdjustment(
  jamo: string,
  role: SyllableRole,
  layoutType: SyllableLayoutType,
): OpticalAdjustment | undefined {
  const horizontal = layoutType === 'horizontal-no-final' || layoutType === 'horizontal-with-final'
  if (!horizontal) return undefined
  if (role === 'initial' && !ROUND_INITIALS.has(jamo)) {
    return { scaleX: 1.35, scaleY: 0.98 }
  }
  if (role === 'medial') {
    return { scaleX: 1.2, scaleY: 0.96 }
  }
  return undefined
}

export function getOpticalAdjustment(
  jamo: string,
  role: SyllableRole,
  layoutType: SyllableLayoutType,
): OpticalAdjustment {
  const rule = JAMO_OPTICAL_ADJUSTMENTS[jamo]
  return mergeOpticalAdjustments(
    getRoleLayoutAdjustment(jamo, role, layoutType),
    rule?.all,
    rule?.roles?.[role],
    rule?.layouts?.[layoutType],
    rule?.roleLayouts?.[role]?.[layoutType],
  )
}

export function applyOpticalAdjustmentToBox(box: LayoutBox, adjustment: OpticalAdjustment): LayoutBox {
  const scaleX = adjustment.scaleX ?? 1
  const scaleY = adjustment.scaleY ?? 1
  const width = box.width * scaleX
  const height = box.height * scaleY
  return {
    x: box.x + (box.width - width) / 2 + (adjustment.translateX ?? 0),
    y: box.y + (box.height - height) / 2 + (adjustment.translateY ?? 0),
    width,
    height,
  }
}
