import type {
  LegacyPracticeItemResult,
  LegacyPracticeSessionRecordV1,
  PracticeSessionRecordV2,
  PracticeSessionState,
} from './types'

export const PRACTICE_RECORDS_V2_KEY = 'hangul-practice-records-v2'
export const PRACTICE_RECORDS_V1_KEY = 'hangul-practice-records-v1'
export const PRACTICE_SOUND_KEY = 'hangul-practice-sound-enabled-v1'

function dateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `practice-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function sanitizeRetryCounts(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object') return {}
  const result: Record<string, number> = {}
  Object.entries(value as Record<string, unknown>).forEach(([item, count]) => {
    if (typeof item === 'string' && typeof count === 'number' && Number.isFinite(count) && count > 0) {
      result[item] = Math.max(0, Math.floor(count))
    }
  })
  return result
}

function sanitizeV2Record(value: unknown): PracticeSessionRecordV2 | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Partial<PracticeSessionRecordV2>
  if (record.version !== 2 || !Array.isArray(record.items)) return null
  const items = record.items.filter((item): item is string => typeof item === 'string')
  const startedAt = typeof record.startedAt === 'string' ? record.startedAt : new Date().toISOString()
  const completedAt = typeof record.completedAt === 'string' ? record.completedAt : startedAt
  const retryCounts = sanitizeRetryCounts(record.retryCounts)
  const retriedItems = items.filter((item) => (retryCounts[item] ?? 0) > 0)
  return {
    version: 2,
    id: typeof record.id === 'string' ? record.id : randomId(),
    date: typeof record.date === 'string' ? record.date : dateKey(completedAt),
    startedAt,
    completedAt,
    durationMs: typeof record.durationMs === 'number' && Number.isFinite(record.durationMs)
      ? Math.max(0, record.durationMs)
      : Math.max(0, new Date(completedAt).getTime() - new Date(startedAt).getTime()),
    items,
    completedCount: typeof record.completedCount === 'number' ? Math.max(0, Math.floor(record.completedCount)) : items.length,
    retryCounts,
    totalRetries: typeof record.totalRetries === 'number'
      ? Math.max(0, Math.floor(record.totalRetries))
      : Object.values(retryCounts).reduce((sum, count) => sum + count, 0),
    retriedItems,
    streakAtCompletion: typeof record.streakAtCompletion === 'number' ? Math.max(0, Math.floor(record.streakAtCompletion)) : 0,
    completed: record.completed !== false,
  }
}

function migrateLegacyRecord(value: unknown): PracticeSessionRecordV2 | null {
  if (!value || typeof value !== 'object') return null
  const legacy = value as LegacyPracticeSessionRecordV1
  const rawItems = Array.isArray(legacy.items) ? legacy.items : []
  const retryCounts: Record<string, number> = {}
  const items = rawItems.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return []
    const legacyItem = entry as LegacyPracticeItemResult
    if (typeof legacyItem.item !== 'string') return []
    const attempts = typeof legacyItem.attempts === 'number' && Number.isFinite(legacyItem.attempts)
      ? Math.max(1, Math.floor(legacyItem.attempts))
      : 1
    retryCounts[legacyItem.item] = Math.max(0, attempts - 1)
    return [legacyItem.item]
  })
  if (!items.length) return null
  const startedAt = typeof legacy.createdAt === 'string' ? legacy.createdAt : new Date().toISOString()
  const completedAt = startedAt
  const totalRetries = Object.values(retryCounts).reduce((sum, count) => sum + count, 0)
  return {
    version: 2,
    id: typeof legacy.id === 'string' ? `migrated-${legacy.id}` : randomId(),
    date: typeof legacy.date === 'string' ? legacy.date : dateKey(completedAt),
    startedAt,
    completedAt,
    durationMs: 0,
    items,
    completedCount: items.length,
    retryCounts,
    totalRetries,
    retriedItems: items.filter((item) => retryCounts[item] > 0),
    streakAtCompletion: 0,
    completed: true,
  }
}

function loadRawArray(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function loadPracticeRecords(): PracticeSessionRecordV2[] {
  const current = loadRawArray(PRACTICE_RECORDS_V2_KEY)
    .map(sanitizeV2Record)
    .filter((record): record is PracticeSessionRecordV2 => Boolean(record))
  const legacy = loadRawArray(PRACTICE_RECORDS_V1_KEY)
    .map(migrateLegacyRecord)
    .filter((record): record is PracticeSessionRecordV2 => Boolean(record))
  const merged = [...current, ...legacy.filter((candidate) => !current.some((record) => record.id === candidate.id))]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
  if (legacy.length) {
    try {
      localStorage.setItem(PRACTICE_RECORDS_V2_KEY, JSON.stringify(merged))
    } catch {
      // Migration remains optional when storage is unavailable.
    }
  }
  return merged
}

export function createSessionRecord(state: PracticeSessionState): PracticeSessionRecordV2 {
  const completedAt = state.completedAt ?? new Date().toISOString()
  const durationMs = Math.max(0, new Date(completedAt).getTime() - new Date(state.startedAt).getTime())
  return {
    version: 2,
    id: randomId(),
    date: dateKey(completedAt),
    startedAt: state.startedAt,
    completedAt,
    durationMs,
    items: [...state.items],
    completedCount: state.completed ? state.items.length : state.currentItemIndex,
    retryCounts: { ...state.itemRetryCounts },
    totalRetries: state.totalRetryCount,
    retriedItems: state.items.filter((item) => (state.itemRetryCounts[item] ?? 0) > 0),
    streakAtCompletion: 0,
    completed: state.completed,
  }
}

export function savePracticeSession(record: PracticeSessionRecordV2): void {
  const records = loadPracticeRecords().filter((item) => item.id !== record.id)
  const withStreak = {
    ...record,
    streakAtCompletion: calculateStreak([record, ...records], new Date(record.completedAt)),
  }
  try {
    localStorage.setItem(PRACTICE_RECORDS_V2_KEY, JSON.stringify([withStreak, ...records].slice(0, 100)))
  } catch {
    // Storage denial must not block the completion screen.
  }
}

export function deletePracticeRecords(): void {
  try {
    localStorage.removeItem(PRACTICE_RECORDS_V2_KEY)
    localStorage.removeItem(PRACTICE_RECORDS_V1_KEY)
  } catch {
    // Ignore unavailable storage.
  }
}

export function calculateStreak(records: PracticeSessionRecordV2[], now = new Date()): number {
  const practicedDates = new Set(records.filter((record) => record.completed).map((record) => record.date))
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!practicedDates.has(dateKey(cursor))) cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1)
  let streak = 0
  while (practicedDates.has(dateKey(cursor))) {
    streak += 1
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1)
  }
  return streak
}

export function getFrequentRetriedItems(records: PracticeSessionRecordV2[]): Array<[string, number]> {
  const totals = new Map<string, number>()
  records.forEach((record) => Object.entries(record.retryCounts).forEach(([item, count]) => {
    totals.set(item, (totals.get(item) ?? 0) + count)
  }))
  return [...totals.entries()].filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))
}

export function getTodayCompletedCount(records: PracticeSessionRecordV2[], now = new Date()): number {
  const today = dateKey(now)
  return records.filter((record) => record.completed && record.date === today).length
}

export function getTotalCompletedCharacters(records: PracticeSessionRecordV2[]): number {
  return records.reduce((sum, record) => sum + record.completedCount, 0)
}

export function loadSoundEnabled(): boolean {
  try {
    return localStorage.getItem(PRACTICE_SOUND_KEY) !== 'false'
  } catch {
    return true
  }
}

export function saveSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(PRACTICE_SOUND_KEY, String(enabled))
  } catch {
    // Ignore unavailable storage.
  }
}
