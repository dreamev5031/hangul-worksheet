import type { HangulDecomposition } from './types'

export const INITIALS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] as const
export const MEDIALS = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'] as const
export const FINALS = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] as const

export const COMPATIBILITY_JAMO = new Set<string>([
  ...INITIALS,
  ...MEDIALS,
  ...FINALS.filter(Boolean),
])

export function isSupportedHangulCharacter(character: string): boolean {
  if (!character) return false
  const code = character.codePointAt(0) ?? 0
  return (code >= 0xac00 && code <= 0xd7a3) || COMPATIBILITY_JAMO.has(character)
}

export function decomposeHangulCharacter(character: string): HangulDecomposition {
  if (!character) return { kind: 'unsupported', character }
  const code = character.codePointAt(0) ?? 0
  if (code >= 0xac00 && code <= 0xd7a3) {
    const syllableIndex = code - 0xac00
    const initialIndex = Math.floor(syllableIndex / 588)
    const medialIndex = Math.floor((syllableIndex % 588) / 28)
    const finalIndex = syllableIndex % 28
    return {
      kind: 'syllable',
      character,
      initial: INITIALS[initialIndex],
      medial: MEDIALS[medialIndex],
      final: FINALS[finalIndex] || undefined,
    }
  }
  if (COMPATIBILITY_JAMO.has(character)) {
    return { kind: 'jamo', character }
  }
  return { kind: 'unsupported', character }
}
