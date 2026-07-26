import type { GeneratedCharacter, StrokePath } from './types'

export const CANONICAL_STROKE_RENDERING_MARKER = 'canonical-stroke-rendering-v2'

export interface CanonicalStrokeLayers {
  background: StrokePath[]
  completed: StrokePath[]
  current?: StrokePath
  pending: StrokePath[]
}

export interface CanonicalStrokeVisualMetrics {
  backgroundWidth: number
  completedWidth: number
  currentWidth: number
  userWidth: number
  startRadius: number
  glowRadius: number
  dash: [number, number]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function getCanonicalStrokeLayers(
  character: GeneratedCharacter,
  currentStrokeIndex: number,
  completedStrokeCount: number,
): CanonicalStrokeLayers {
  return {
    background: character.strokes,
    completed: character.strokes.slice(0, completedStrokeCount),
    current: character.strokes[currentStrokeIndex],
    pending: character.strokes.slice(Math.max(completedStrokeCount, currentStrokeIndex + 1)),
  }
}

export function getCanonicalStrokeVisualMetrics(side: number, stroke: StrokePath): CanonicalStrokeVisualMetrics {
  const scaledWidth = clamp(stroke.thickness * side, 4.5, 17)
  return {
    backgroundWidth: clamp(scaledWidth * 0.72, 3.5, 11),
    completedWidth: clamp(scaledWidth * 1.02, 5, 18),
    currentWidth: clamp(scaledWidth * 0.88, 4.5, 16),
    userWidth: clamp(side * 0.017, 6, 15),
    startRadius: clamp(side * 0.017, 8, 14),
    glowRadius: clamp(side * 0.011, 6, 10),
    dash: [clamp(side * 0.008, 4, 8), clamp(side * 0.012, 6, 12)],
  }
}
