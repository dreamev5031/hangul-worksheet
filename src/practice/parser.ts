import type { PracticeProgressMode } from './types'

export const MAX_PRACTICE_ITEMS = 10

export interface ParsedPracticeItems {
  items: string[]
  totalBeforeLimit: number
  truncated: boolean
  estimatedMinutes: number
}

function splitGraphemes(value: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(value), (part) => part.segment)
  }
  return Array.from(value)
}

function splitInputGroups(input: string): string[] {
  return input
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function parsePracticeItems(input: string, mode: PracticeProgressMode): ParsedPracticeItems {
  const groups = splitInputGroups(input)
  const source = mode === 'character'
    ? groups.flatMap((group) => splitGraphemes(group).filter((part) => !/^\s+$/u.test(part)))
    : groups
  const unique = [...new Set(source)]
  const items = unique.slice(0, MAX_PRACTICE_ITEMS)

  return {
    items,
    totalBeforeLimit: unique.length,
    truncated: unique.length > MAX_PRACTICE_ITEMS,
    estimatedMinutes: Math.max(1, Math.ceil(items.length * (mode === 'character' ? 0.7 : 1.2))),
  }
}
