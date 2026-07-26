import type { PracticeSessionConfig } from './types'

export const PRACTICE_CONFIG_KEY = 'hangul-practice-config-v1'
export const PRACTICE_PROGRESS_KEY = 'hangul-practice-progress-v1'
export const WORKSHEET_PREFILL_KEY = 'hangul-worksheet-prefill-v1'

export function savePracticeConfig(config: PracticeSessionConfig) {
  sessionStorage.setItem(PRACTICE_CONFIG_KEY, JSON.stringify(config))
}

export function loadPracticeConfig(): PracticeSessionConfig | null {
  try {
    const raw = sessionStorage.getItem(PRACTICE_CONFIG_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PracticeSessionConfig
    if (!parsed.rawText || !['faint', 'dotted', 'independent'].includes(parsed.displayMode)) return null
    if (!['character', 'line'].includes(parsed.progressMode)) return null
    return parsed
  } catch {
    return null
  }
}
