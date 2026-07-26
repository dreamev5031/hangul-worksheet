import type { PracticeItemResult, PracticeSessionRecord } from './types'

const STORAGE_KEY = 'hangul-practice-records-v1'
const MAX_SESSIONS = 100

interface PracticeStorage {
  version: 1
  sessions: PracticeSessionRecord[]
}

export function loadPracticeRecords(): PracticeSessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PracticeStorage
    if (parsed.version !== 1 || !Array.isArray(parsed.sessions)) return []
    return parsed.sessions
  } catch {
    return []
  }
}

export function savePracticeSession(record: PracticeSessionRecord) {
  const sessions = [record, ...loadPracticeRecords().filter((item) => item.id !== record.id)].slice(0, MAX_SESSIONS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sessions } satisfies PracticeStorage))
}

export function deletePracticeRecords() {
  localStorage.removeItem(STORAGE_KEY)
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function calculateStreak(records: PracticeSessionRecord[]) {
  const practiced = new Set(records.map((record) => record.date))
  const cursor = new Date()
  if (!practiced.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (practiced.has(toDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function getBestScoresByItem(records: PracticeSessionRecord[]) {
  const best = new Map<string, number>()
  records.forEach((record) => record.items.forEach((item) => {
    best.set(item.item, Math.max(best.get(item.item) ?? 0, item.bestScore))
  }))
  return [...best.entries()].sort((a, b) => b[1] - a[1])
}

export function getRecentSevenDays(records: PracticeSessionRecord[]) {
  const practiced = new Set(records.map((record) => record.date))
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    return { date: toDateKey(date), practiced: practiced.has(toDateKey(date)) }
  })
}

export function createSessionRecord(items: PracticeItemResult[]): PracticeSessionRecord {
  const now = new Date()
  const totalAttempts = items.reduce((total, item) => total + item.attempts, 0)
  const average = items.length ? Math.round(items.reduce((total, item) => total + item.bestScore, 0) / items.length) : 0
  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    date: toDateKey(now),
    createdAt: now.toISOString(),
    items,
    average,
    best: Math.max(0, ...items.map((item) => item.bestScore)),
    totalAttempts,
  }
}
