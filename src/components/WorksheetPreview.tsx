import { forwardRef } from 'react'
import type { WorksheetSettings } from '../types'
import AutoFitText from './AutoFitText'

interface WorksheetPreviewProps {
  settings: WorksheetSettings
  words: string[]
}

type PracticeItemKind = 'character' | 'word' | 'sentence'

const practiceModeLabels: Record<WorksheetSettings['practiceMode'], string> = {
  trace: '따라쓰기 많이',
  balanced: '따라쓰기 · 빈칸',
  independent: '빈칸 많이',
}

function getPracticeItemKind(item: string): PracticeItemKind {
  if (/\s/.test(item.trim())) return 'sentence'
  if (Array.from(item).length === 1) return 'character'
  return 'word'
}

function getTraceRowCount(settings: WorksheetSettings) {
  if (!settings.includeBlank || settings.practiceMode === 'trace') return settings.repeatRows
  if (settings.practiceMode === 'balanced') return Math.ceil(settings.repeatRows / 2)
  return 1
}

const WorksheetPreview = forwardRef<HTMLDivElement, WorksheetPreviewProps>(
  ({ settings, words }, ref) => {
    const visibleItems = words.length > 0 ? words : ['가']
    const sizeClass = 'letters-' + settings.letterSize
    const traceRowCount = getTraceRowCount(settings)
    const showStudentFields = settings.showNameField || settings.showDateField
    const hasSingleStudentField = settings.showNameField !== settings.showDateField

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
            className={'worksheet-page ' + sizeClass}
            data-density={visibleItems.length > 4 ? 'dense' : 'comfortable'}
          >
            <div className="worksheet-topline" />
            <header className="worksheet-header">
              <div>
                <span className="worksheet-kicker">한 글자씩 천천히, 또박또박</span>
                <h2>오늘의 한글 연습</h2>
              </div>
              <span className="practice-mode-stamp">{practiceModeLabels[settings.practiceMode]}</span>
            </header>

            {showStudentFields && (
              <div className={'student-fields ' + (hasSingleStudentField ? 'single-field' : '')}>
                {settings.showNameField && <span>이름 <i /></span>}
                {settings.showDateField && <span>날짜 <i /></span>}
              </div>
            )}

            <div className="today-label">
              <span>오늘의 연습</span>
              <i />
            </div>

            <div
              className="worksheet-words"
              style={{ gridTemplateRows: 'repeat(' + visibleItems.length + ', minmax(0, 1fr))' }}
            >
              {visibleItems.map((item, itemIndex) => {
                const kind = getPracticeItemKind(item)
                const blankLabel = kind === 'sentence' ? '문장을 써 보세요' : '혼자 써 보기'

                return (
                  <article
                    className="word-practice"
                    data-kind={kind}
                    key={item + '-' + itemIndex}
                  >
                    <div className="word-display">
                      <span className="word-index">{String(itemIndex + 1).padStart(2, '0')}</span>
                      <AutoFitText
                        className="display-text"
                        fitKey={settings.letterSize}
                        text={item}
                      />
                    </div>

                    <div className="writing-lines">
                      {Array.from({ length: settings.repeatRows }, (_, lineIndex) => {
                        const isTraceLine = lineIndex < traceRowCount
                        return (
                          <div
                            className={'writing-line ' + (isTraceLine ? 'trace-line' : 'blank-line')}
                            key={lineIndex}
                          >
                            {isTraceLine
                              ? (
                                  <AutoFitText
                                    className="trace-word"
                                    fitKey={settings.letterSize}
                                    text={item}
                                  />
                                )
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