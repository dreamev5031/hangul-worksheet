interface PracticeSessionHeaderProps {
  character: string
  currentIndex: number
  totalItems: number
  soundEnabled: boolean
  onExit: () => void
  onToggleSound: () => void
  onHistory: () => void
}

export default function PracticeSessionHeader({
  character,
  currentIndex,
  totalItems,
  soundEnabled,
  onExit,
  onToggleSound,
  onHistory,
}: PracticeSessionHeaderProps) {
  return (
    <header className="compact-session-header">
      <button className="session-exit-button" type="button" onClick={onExit} aria-label="연습 나가기">나가기</button>
      <div className="compact-session-progress" aria-label={`현재 ${currentIndex + 1}번째 글자, 전체 ${totalItems}개`}>
        <span className="landscape-session-title">한글 획순 연습</span>
        <span className="portrait-session-progress">
          <strong>{character}</strong>
          <span>{currentIndex + 1} / {totalItems}</span>
        </span>
      </div>
      <div className="header-utilities">
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? '연습 효과음 끄기' : '연습 효과음 켜기'}
          aria-pressed={soundEnabled}
        >
          {soundEnabled ? '소리 켬' : '소리 끔'}
        </button>
        <button type="button" onClick={onHistory} aria-label="연습 기록 보기">기록</button>
      </div>
    </header>
  )
}
