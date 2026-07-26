export type PracticeDisplayMode = 'faint' | 'dotted' | 'independent'
export type PracticeProgressMode = 'character' | 'line'

export interface PracticeSessionConfig {
  rawText: string
  displayMode: PracticeDisplayMode
  progressMode: PracticeProgressMode
}

export interface PracticePoint {
  x: number
  y: number
  pressure: number
  time: number
}

export interface PracticeStroke {
  points: PracticePoint[]
}

export interface PracticeScoreMetrics {
  precision: number
  coverage: number
  f1: number
  centerOffsetX: number
  centerOffsetY: number
  sizeRatio: number
  userAreaRatio: number
  jitter: number
  strokeCount: number
  pointCount: number
}

export interface PracticeScore {
  total: number
  shape: number
  sizePosition: number
  completion: number
  stability: number
  metrics: PracticeScoreMetrics
  feedback: string[]
}

export interface PracticeItemResult {
  item: string
  firstScore: number
  bestScore: number
  attempts: number
  bestBreakdown: PracticeScore
}

export interface PracticeSessionRecord {
  id: string
  date: string
  createdAt: string
  items: PracticeItemResult[]
  average: number
  best: number
  totalAttempts: number
}
