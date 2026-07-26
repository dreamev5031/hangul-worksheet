import { parsePracticeItems } from '../practice/parser'
import { generateCharacterStrokes } from '../practice/syllableLayout'

interface PracticePreviewProps {
  rawText: string
}

export default function PracticePreview({ rawText }: PracticePreviewProps) {
  const parsed = parsePracticeItems(rawText)
  const firstItem = parsed.items[0] ?? '가'
  const generated = generateCharacterStrokes(firstItem)

  return (
    <section className="practice-preview-area" aria-labelledby="practice-preview-title">
      <div className="preview-toolbar no-print">
        <div>
          <span className="step-number">2</span>
          <div>
            <h2 id="practice-preview-title">획순 연습 미리보기</h2>
            <p>실제 연습에서는 현재 획만 밝게 안내해요.</p>
          </div>
        </div>
        <span className="live-badge"><i /> 준비</span>
      </div>

      <div className="practice-preview-card">
        <div className="practice-preview-sample stroke-order-preview" aria-label={`${firstItem} 획순 미리보기`}>
          <svg viewBox="0 0 100 100" role="img" aria-hidden="true">
            {generated?.strokes.map((stroke, index) => (
              <polyline
                key={stroke.id}
                points={stroke.guidePoints.map((point) => `${point.x * 100},${point.y * 100}`).join(' ')}
                className={index === 0 ? 'preview-current-stroke' : 'preview-future-stroke'}
              />
            ))}
            {generated?.strokes[0] && <circle cx={generated.strokes[0].start.x * 100} cy={generated.strokes[0].start.y * 100} r="3.4" />}
          </svg>
        </div>
        <dl className="practice-preview-details">
          <div><dt>첫 연습 글자</dt><dd>{firstItem}</dd></div>
          <div><dt>총 연습 글자</dt><dd>{parsed.items.length}개</dd></div>
          <div><dt>첫 글자 획 수</dt><dd>{generated?.strokes.length ?? 0}획</dd></div>
          <div><dt>진행 방식</dt><dd>한 획씩 자동 진행</dd></div>
        </dl>
        {parsed.excluded.length > 0 && (
          <p className="limit-notice" role="status">화면 연습에서 제외: {parsed.excluded.join(' ')}</p>
        )}
        {parsed.truncated && <p className="limit-notice">앞의 10개 글자만 연습해요.</p>}
        {!parsed.items.length && <p className="limit-notice">연습할 한글을 먼저 입력해 주세요.</p>}
      </div>
    </section>
  )
}
