import type { PracticeDisplayMode, PracticeProgressMode } from '../practice/types'
import { parsePracticeItems } from '../practice/parser'

interface PracticePreviewProps {
  rawText: string
  displayMode: PracticeDisplayMode
  progressMode: PracticeProgressMode
}

const displayLabels: Record<PracticeDisplayMode, string> = {
  faint: '흐린 글자 위에 따라 쓰기',
  dotted: '점선 글자 위에 따라 쓰기',
  independent: '글자를 보고 혼자 쓰기',
}

export default function PracticePreview({ rawText, displayMode, progressMode }: PracticePreviewProps) {
  const parsed = parsePracticeItems(rawText, progressMode)
  const firstItem = parsed.items[0] ?? '가'

  return (
    <section className="practice-preview-area" aria-labelledby="practice-preview-title">
      <div className="preview-toolbar no-print">
        <div>
          <span className="step-number">2</span>
          <div>
            <h2 id="practice-preview-title">화면 연습 미리보기</h2>
            <p>실제 연습에서는 한 항목씩 크게 보여요.</p>
          </div>
        </div>
        <span className="live-badge"><i /> 준비</span>
      </div>

      <div className="practice-preview-card">
        <div className="practice-preview-sample" data-mode={displayMode}>
          {displayMode === 'independent' && <span className="practice-reference-label">보고 써 보세요</span>}
          <strong>{firstItem}</strong>
        </div>
        <dl className="practice-preview-details">
          <div><dt>연습 첫 항목</dt><dd>{firstItem}</dd></div>
          <div><dt>총 연습 항목</dt><dd>{parsed.items.length}개</dd></div>
          <div><dt>예상 연습 시간</dt><dd>약 {parsed.estimatedMinutes}분</dd></div>
          <div><dt>표시 방식</dt><dd>{displayLabels[displayMode]}</dd></div>
        </dl>
        {parsed.truncated && (
          <p className="limit-notice" role="status">
            입력한 항목이 {parsed.totalBeforeLimit}개라 앞의 10개만 연습해요.
          </p>
        )}
        {!parsed.items.length && <p className="limit-notice">연습할 글자나 단어를 먼저 입력해 주세요.</p>}
      </div>
    </section>
  )
}
