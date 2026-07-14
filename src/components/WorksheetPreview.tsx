import { forwardRef } from 'react'
import type { WorksheetSettings } from '../types'

interface WorksheetPreviewProps {
  settings: WorksheetSettings
  words: string[]
}

const templateTitles: Record<WorksheetSettings['template'], string> = {
  basic: '오늘의 한글쓰기',
  name: '내 이름 따라쓰기',
  large: '큰글씨 한글쓰기',
}

const WorksheetPreview = forwardRef<HTMLDivElement, WorksheetPreviewProps>(
  ({ settings, words }, ref) => {
    const visibleWords = words.length > 0 ? words : ['연습할 단어']
    const sizeClass = settings.letterSize === 'large' || settings.template === 'large'
      ? 'letters-large'
      : 'letters-normal'

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
            data-density={visibleWords.length > 4 ? 'dense' : 'comfortable'}
          >
            <div className="worksheet-topline" />
            <header className="worksheet-header">
              <div>
                <span className="worksheet-kicker">한 글자씩 천천히, 또박또박</span>
                <h2>{templateTitles[settings.template]}</h2>
              </div>
              <span className="age-stamp">{settings.age}</span>
            </header>

            <div className="student-fields">
              <span>이름 <i /></span>
              <span>날짜 <i /></span>
            </div>

            <div className="today-label">
              <span>오늘의 단어</span>
              <i />
            </div>

            <div className="worksheet-words">
              {visibleWords.map((word, wordIndex) => (
                <article className="word-practice" key={`${word}-${wordIndex}`}>
                  <div className="word-display">
                    <span>{String(wordIndex + 1).padStart(2, '0')}</span>
                    <strong>{word}</strong>
                  </div>

                  <div className="writing-lines">
                    {Array.from({ length: settings.repeatRows }, (_, lineIndex) => (
                      <div className="writing-line trace-line" key={lineIndex}>
                        <span className="trace-word">{word}</span>
                        <span className="baseline" />
                      </div>
                    ))}
                    {settings.includeBlank && (
                      <div className="writing-line blank-line">
                        <span className="blank-label">혼자 써 보기</span>
                        <span className="baseline" />
                      </div>
                    )}
                  </div>
                </article>
              ))}
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
