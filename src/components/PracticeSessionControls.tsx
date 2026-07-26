interface PracticeSessionControlsProps {
  onRestartCharacter: () => void
  onReplayGuide: () => void
}

export default function PracticeSessionControls({ onRestartCharacter, onReplayGuide }: PracticeSessionControlsProps) {
  return (
    <footer className="compact-action-bar" aria-label="연습 도구">
      <button type="button" onClick={onRestartCharacter}>현재 글자 처음부터</button>
      <button type="button" onClick={onReplayGuide}>획 안내 다시 보기</button>
    </footer>
  )
}
