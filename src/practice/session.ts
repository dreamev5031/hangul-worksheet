import type { PracticeSessionConfig, PracticeSessionState } from './types'

export const PRACTICE_CONFIG_KEY = 'hangul-practice-config-v2'
export const WORKSHEET_PREFILL_KEY = 'hangul-worksheet-prefill-v1'

export function createPracticeSessionState(items: string[], startedAt = new Date().toISOString()): PracticeSessionState {
  return {
    items: [...items],
    currentItemIndex: 0,
    currentStrokeIndex: 0,
    completedStrokeCount: 0,
    itemRetryCounts: {},
    currentStrokeRetryCount: 0,
    totalRetryCount: 0,
    startedAt,
    completed: false,
  }
}

export function applyStrokeOutcome(
  state: PracticeSessionState,
  accepted: boolean,
  currentItemStrokeCount: number,
  completedAt = new Date().toISOString(),
): PracticeSessionState {
  if (state.completed || !state.items.length || currentItemStrokeCount <= 0) return state
  const item = state.items[state.currentItemIndex]
  if (!accepted) {
    return {
      ...state,
      currentStrokeRetryCount: state.currentStrokeRetryCount + 1,
      totalRetryCount: state.totalRetryCount + 1,
      itemRetryCounts: {
        ...state.itemRetryCounts,
        [item]: (state.itemRetryCounts[item] ?? 0) + 1,
      },
    }
  }

  const nextCompletedStrokeCount = state.completedStrokeCount + 1
  const lastStroke = state.currentStrokeIndex >= currentItemStrokeCount - 1
  if (!lastStroke) {
    return {
      ...state,
      currentStrokeIndex: state.currentStrokeIndex + 1,
      completedStrokeCount: nextCompletedStrokeCount,
      currentStrokeRetryCount: 0,
    }
  }

  const lastItem = state.currentItemIndex >= state.items.length - 1
  if (lastItem) {
    return {
      ...state,
      completedStrokeCount: nextCompletedStrokeCount,
      currentStrokeRetryCount: 0,
      completed: true,
      completedAt,
    }
  }

  return {
    ...state,
    currentItemIndex: state.currentItemIndex + 1,
    currentStrokeIndex: 0,
    completedStrokeCount: 0,
    currentStrokeRetryCount: 0,
  }
}

export function restartCurrentCharacter(state: PracticeSessionState): PracticeSessionState {
  return {
    ...state,
    currentStrokeIndex: 0,
    completedStrokeCount: 0,
    currentStrokeRetryCount: 0,
  }
}

export function getRetriedItems(state: PracticeSessionState): string[] {
  return state.items.filter((item) => (state.itemRetryCounts[item] ?? 0) > 0)
}

export function savePracticeConfig(config: PracticeSessionConfig): void {
  try {
    localStorage.setItem(PRACTICE_CONFIG_KEY, JSON.stringify(config))
  } catch {
    // Private browsing or storage denial must not block practice.
  }
}

export function loadPracticeConfig(): PracticeSessionConfig | null {
  try {
    const raw = localStorage.getItem(PRACTICE_CONFIG_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PracticeSessionConfig>
    return typeof parsed.rawText === 'string' ? { rawText: parsed.rawText } : null
  } catch {
    return null
  }
}
