import { forwardRef } from 'react'
import type { WorksheetSettings } from '../types'

interface WorksheetPreviewProps {
  settings: WorksheetSettings
  words: string[]
}

type PracticeItemKind = 'character' | 'word' | 'sentence'

const templateTitles: Record<WorksheetSettings['template'], string> = {
  letter: '오늘의 글자 연습',
  word: '오늘의 단어 연습',
  sentence: '이름·문장 연습',
}

const todayLabels: Record<WorksheetSettings['template'], string> = {
  letter: '오늘의 글자',
  word: '오늘의 단어',
  sentence: '오늘의 이름·문장',
}

const practiceModeLabels: Record<WorksheetSettings['practiceMode'], string> = {
  trace: '따라쓰기 중심',
  balanced: '따라쓰기 · 혼자쓰기',
  independent: '혼자쓰기 중심',
}

function getPracticeItemKind(item: string): PracticeItemKind {
  if (/\s/.test(item.trim())) return 'sentence'
  if (Array.from(item).length === 1) return 'character'
  return 'word'
}

function getTraceRowCount(settings: WorksheetSettings) {
  if (settings.practiceMode === 'trace') return settings.repeatRows
  if (settings.practiceMode === 'balanced') return Math.ceil(settings.repeatRows / 2)
  return 1
}

const WorksheetPreview = forwardRef<HTMLDivElement, WorksheetPreviewProps>(
  ({ settings, words }, ref) => {
    const visibleItems = words.length > 0 ? words : ['가']
    const sizeClass = settings.letterSize === 'large' ? 'letters-large' : 'letters-normal'
    const traceRowCount = getTraceRowCount(settings)

    return (
      <section className="preview-area" aria-labelledby="preview-title">
        <div className="preview-toolbar no-print">
          <div>
            <span className="step-number">2</span>
            <div>
              <h2 id="preview-title">A4 미리보기</h2>
              <p>입력하는 즉시 학습지가 바뀌어요.</p>
            </div>
          </div>
          <span className="live-badge"><i /> 실시간</span>
        </div>

        <div className="paper-stage">
          <div
            ref={ref}
            className={`worksheet-page ${sizeClass}`}
            data-template={settings.template}
            data-density={visibleItems.length > 4 ? 'dense' : 'comfortable'}
          >
            <div className="worksheet-topline" />
            <header className="worksheet-header">
              <div>
                <span className="worksheet-kicker">한 글자씩 천천히, 또박또박</span>
                <h2>{templateTitles[settings.template]}</h2>
              </div>
              <span className="practice-mode-stamp">{practiceModeLabels[settings.practiceMode]}</span>
            </header>

            <div className="student-fields">
              <span>이름 <i /></span>
              <span>날짜 <i /></span>
            </div>

            <div className="today-label">
              <span>{todayLabels[settings.template]}</span>
              <i />
            </div>

            <div className="worksheet-words">
              {visibleItems.map((item, itemIndex) => {
                const kind = settings.template === 'sentence' ? 'sentence' : getPracticeItemKind(item)
                const blankLabel = kind === 'sentence' ? '문장을 써 보세요' : '혼자 써 보기'

                return (
                  <article
                    className="word-practice"
                    data-kind={kind}
                    key={`${item}-${itemIndex}`}
                  >
                    <div className="word-display">
                      <span>{String(itemIndex + 1).padStart(2, '0')}</span>
                      <strong>{item}</strong>
                    </div>

                    <div className="writing-lines">
                      {Array.from({ length: settings.repeatRows }, (_, lineIndex) => {
                        const isTraceLine = lineIndex < traceRowCount
                        return (
                          <div
                            className={`writing-line ${isTraceLine ? 'trace-line' : 'blank-line'}`}
                            key={lineIndex}
                          >
                            {isTraceLine
                              ? <span className="trace-word">{item}</span>
                              : <span className="blank-label">{blankLabel}</span>}
                            <span className="baseline" />
                          </div>
                        )
                      })}
                    </div>
                  </article>
                )
              })}
            </div>

            {settings.includePraise && (
              <footer className="praise-message">
                <span aria-hidden="true">★</span>
                오늘도 또박또박 잘 썼어요!
                <span aria-hidden="true">★</span>
              </footer>
            )}
          </div>
        </div>
      </section>
    )
  },
)

WorksheetPreview.displayName = 'WorksheetPreview'

export default WorksheetPreview
