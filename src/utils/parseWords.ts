/** 줄바꿈 또는 쉼표로 구분된 글자·단어·문장을 정리하고 중복을 제거합니다. */
export function parseWords(input: string): string[] {
  return [...new Set(
    input
      .split(/[\n,]+/)
      .map((word) => word.trim())
      .filter(Boolean),
  )]
}
