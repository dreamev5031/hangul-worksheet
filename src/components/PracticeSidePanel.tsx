interface PracticeSidePanelProps {
  character: string
  currentIndex: number
  totalItems: number
  currentStrokeIndex: number
  totalStrokes: number
  statusMessage: string
  phase: 'writing' | 'stroke-success' | 'retry' | 'character-complete'
  soundEnabled: boolean
  onToggleSound: () => void
  onHistory: () => void
  onRestartCharacter: () => void
  onReplayGuide: () => void
}

export default function PracticeSidePanel({
  character,
  currentIndex,
  totalItems,
  currentStrokeIndex,
  totalStrokes,
  statusMessage,
  phase,
  soundEnabled,
  onToggleSound,
  onHistory,
  onRestartCharacter,
  onReplayGuide,
}: PracticeSidePanelProps) {
  return (
    <aside className="practice-side-panel" aria-label="현재 획 정보와 연습 도구">
      <div className="side-panel-progress">
        <strong aria-label={`현재 글자 ${character}`}>{character}</strong>
        <div>
          <span>글자 {currentIndex + 1} / {totalItems}</span>
          <span>현재 {currentStrokeIndex + 1} / {totalStrokes}획</span>
        </div>
      </div>

      <p className={`side-panel-message message-${phase}`} aria-live="polite">{statusMessage}</p>

      <div className="side-panel-actions">
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? '연습 효과음 끄기' : '연습 효과음 켜기'}
          aria-pressed={soundEnabled}
        >
          {soundEnabled ? '소리 끄기' : '소리 켜기'}
        </button>
        <button type="button" onClick={onHistory}>기록 보기</button>
        <button type="button" onClick={onRestartCharacter}>현재 글자 처음부터</button>
        <button type="button" onClick={onReplayGuide}>획 안내 다시 보기</button>
      </div>
    </aside>
  )
}
