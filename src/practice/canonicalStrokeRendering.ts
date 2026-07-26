import type { GeneratedCharacter, StrokePath } from './types'

export const CANONICAL_STROKE_RENDERING_MARKER = 'canonical-stroke-rendering-v3-optical-fit'

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
  const scaledWidth = clamp(stroke.thickness * side, 4.2, 15)
  return {
    backgroundWidth: clamp(scaledWidth * 0.58, 3.2, 9),
    completedWidth: clamp(scaledWidth * 0.98, 5, 15),
    currentWidth: clamp(scaledWidth * 0.82, 4.4, 14),
    userWidth: clamp(side * 0.016, 6, 14),
    startRadius: clamp(side * 0.016, 8, 13),
    glowRadius: clamp(side * 0.01, 6, 9.5),
    dash: [clamp(side * 0.007, 4, 7), clamp(side * 0.01, 6, 10)],
  }
}
