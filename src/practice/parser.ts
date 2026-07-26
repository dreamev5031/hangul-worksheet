import { isSupportedHangulCharacter } from './hangulDecompose'
import type { PracticeParseResult } from './types'

const MAX_ITEMS = 10

function segmentGraphemes(value: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const Segmenter = Intl.Segmenter as typeof Intl.Segmenter
    return Array.from(new Segmenter('ko', { granularity: 'grapheme' }).segment(value), (entry) => entry.segment)
  }
  return Array.from(value)
}

export function parsePracticeItems(rawText: string): PracticeParseResult {
  const normalized = rawText.replace(/,/g, '\n')
  const supported: string[] = []
  const excluded: string[] = []
  const seen = new Set<string>()
  segmentGraphemes(normalized).forEach((segment) => {
    if (/^\s+$/u.test(segment)) return
    if (isSupportedHangulCharacter(segment)) {
      if (!seen.has(segment)) {
        seen.add(segment)
        supported.push(segment)
      }
    } else if (!excluded.includes(segment)) {
      excluded.push(segment)
    }
  })
  const items = supported.slice(0, MAX_ITEMS)
  return {
    items,
    excluded,
    truncated: supported.length > MAX_ITEMS,
    totalBeforeLimit: supported.length,
    estimatedMinutes: Math.max(1, Math.ceil(items.length * 0.6)),
  }
}
