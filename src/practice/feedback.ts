import type { PracticeScoreMetrics } from './types'

export function buildPracticeFeedback(total: number, metrics: PracticeScoreMetrics): string[] {
  if (total >= 88) return ['모양과 위치가 아주 좋아요!']

  const feedback: string[] = []
  if (metrics.centerOffsetX > 0.11) feedback.push('글자가 오른쪽으로 조금 치우쳤어요. 가운데에 맞춰 써보세요.')
  else if (metrics.centerOffsetX < -0.11) feedback.push('글자가 왼쪽으로 조금 치우쳤어요. 가운데에 맞춰 써보세요.')

  if (feedback.length < 2 && metrics.sizeRatio < 0.68) feedback.push('글자를 조금 더 크게 써보세요.')
  else if (feedback.length < 2 && metrics.sizeRatio > 1.38) feedback.push('글자가 연습 칸을 많이 벗어났어요. 조금 작게 써보세요.')

  if (feedback.length < 2 && metrics.coverage < 0.52) feedback.push('빠진 부분이 있어요. 흐린 글자를 끝까지 따라가 보세요.')
  if (feedback.length < 2 && metrics.precision < 0.55) feedback.push('기준 글자에서 벗어난 선이 많아요. 조금 천천히 써보세요.')
  if (feedback.length < 2 && metrics.jitter > 0.46) feedback.push('선을 조금 더 천천히 이어서 써보세요.')
  if (feedback.length === 0) feedback.push('좋아요. 모양을 한 번 더 천천히 따라 써보세요.')
  return feedback.slice(0, 2)
}
