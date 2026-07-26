export interface PracticePoint {
  x: number
  y: number
  pressure?: number
  time?: number
}

export type StrokePathKind = 'line' | 'polyline' | 'curve' | 'closed-curve'

export interface StrokeDirection {
  dx: number
  dy: number
}

export interface StrokePath {
  id: string
  points: PracticePoint[]
  guidePoints: PracticePoint[]
  waypoints: PracticePoint[]
  start: PracticePoint
  end: PracticePoint
  direction: StrokeDirection
  pathKind: StrokePathKind
  closed: boolean
  thickness: number
  tolerance: number
  curved: boolean
  preserveAspect: boolean
}

export type SyllableLayoutType =
  | 'vertical-no-final'
  | 'vertical-with-final'
  | 'horizontal-no-final'
  | 'horizontal-with-final'
  | 'compound-no-final'
  | 'compound-with-final'

export type SyllableRole = 'initial' | 'medial' | 'final'
export type SyllableFinalKind = 'none' | 'single' | 'cluster'

export interface GlyphBounds {
  x: number
  y: number
  width: number
  height: number
  right: number
  bottom: number
  centerX: number
  centerY: number
}

export interface GlyphFitMetadata {
  before: GlyphBounds
  after: GlyphBounds
  target: GlyphBounds
  scale: number
  translateX: number
  translateY: number
  usageX: number
  usageY: number
}

export interface GeneratedCharacter {
  character: string
  strokes: StrokePath[]
  kind: 'syllable' | 'jamo'
  initial?: string
  medial?: string
  final?: string
  layoutType?: SyllableLayoutType
  finalKind?: SyllableFinalKind
  fit?: GlyphFitMetadata
  overrideKey?: string
}

export interface HangulDecomposition {
  kind: 'syllable' | 'jamo' | 'unsupported'
  character: string
  initial?: string
  medial?: string
  final?: string
}

export interface PracticeParseResult {
  items: string[]
  excluded: string[]
  truncated: boolean
  totalBeforeLimit: number
  estimatedMinutes: number
}

export interface PracticeSessionConfig {
  rawText: string
}

export interface StrokeValidationConfig {
  sampleCount: number
  baseTolerance: number
  startToleranceMultiplier: number
  endToleranceMultiplier: number
  minimumLengthRatio: number
  maximumLengthRatio: number
  minimumNearRatio: number
  minimumCoverageRatio: number
  minimumWaypointRatio: number
  minimumDirectionCosine: number
  maximumBoundingArea: number
}

export type StrokeFailureReason =
  | 'empty'
  | 'too-short'
  | 'reverse-direction'
  | 'wrong-location'
  | 'missed-turn'
  | 'off-path'
  | 'scribble'

export interface StrokeValidationMetrics {
  startDistance: number
  endDistance: number
  directionCosine: number
  nearRatio: number
  coverageRatio: number
  waypointRatio: number
  lengthRatio: number
  boundingArea: number
}

export interface StrokeValidationResult {
  accepted: boolean
  reason?: StrokeFailureReason
  metrics: StrokeValidationMetrics
}

export interface PracticeSessionState {
  items: string[]
  currentItemIndex: number
  currentStrokeIndex: number
  completedStrokeCount: number
  itemRetryCounts: Record<string, number>
  currentStrokeRetryCount: number
  totalRetryCount: number
  startedAt: string
  completedAt?: string
  completed: boolean
}

export interface PracticeSessionRecordV2 {
  version: 2
  id: string
  date: string
  startedAt: string
  completedAt: string
  durationMs: number
  items: string[]
  completedCount: number
  retryCounts: Record<string, number>
  totalRetries: number
  retriedItems: string[]
  streakAtCompletion: number
  completed: boolean
}

export interface LegacyPracticeItemResult {
  item?: unknown
  attempts?: unknown
}

export interface LegacyPracticeSessionRecordV1 {
  id?: unknown
  date?: unknown
  createdAt?: unknown
  items?: unknown
  totalAttempts?: unknown
}

export type AudioFeedbackKind = 'stroke-success' | 'retry' | 'character-complete' | 'session-complete'

export interface AudioTone {
  frequency: number
  start: number
  duration: number
  gain: number
  type?: OscillatorType
}

export interface AudioFeedbackController {
  unlock: () => Promise<boolean>
  play: (kind: AudioFeedbackKind) => void
  setMuted: (muted: boolean) => void
  isMuted: () => boolean
  dispose: () => void
}
