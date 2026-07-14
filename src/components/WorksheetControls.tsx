import type { WorksheetSettings } from '../types'

interface WorksheetControlsProps {
  settings: WorksheetSettings
  onChange: (next: WorksheetSettings) => void
  onDownload: () => void
  onPrint: () => void
  isDownloading: boolean
}

const ages: WorksheetSettings['age'][] = ['5세', '6세', '7세', '초등 입학 전']

const templates: Array<{
  value: WorksheetSettings['template']
  title: string
  description: string
}> = [
  { value: 'basic', title: '기본 한글쓰기', description: '단어를 보고 따라 써요' },
  { value: 'name', title: '이름 따라쓰기', description: '내 이름을 바르게 써요' },
  { value: 'large', title: '큰글씨 연습', description: '더 크고 시원하게 써요' },
]

export default function WorksheetControls({
  settings,
  onChange,
  onDownload,
  onPrint,
  isDownloading,
}: WorksheetControlsProps) {
  const update = <K extends keyof WorksheetSettings>(
    key: K,
    value: WorksheetSettings[K],
  ) => onChange({ ...settings, [key]: value })

  return (
    <section className="controls-card no-print" aria-labelledby="controls-title">
      <div className="section-heading">
        <span className="step-number">1</span>
        <div>
          <h2 id="controls-title">학습지 만들기</h2>
          <p>연습할 내용을 골라 주세요.</p>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="words">연습할 단어</label>
        <textarea
          id="words"
          value={settings.rawWords}
          onChange={(event) => update('rawWords', event.target.value)}
          placeholder={'공룡\n사과\n김민준'}
          rows={4}
        />
        <p className="field-hint">줄바꿈이나 쉼표로 여러 단어를 나눌 수 있어요.</p>
      </div>

      <fieldset className="control-group">
        <legend>아이 나이</legend>
        <div className="segmented age-options">
          {ages.map((age) => (
            <label key={age} className={settings.age === age ? 'selected' : ''}>
              <input
                type="radio"
                name="age"
                value={age}
                checked={settings.age === age}
                onChange={() => update('age', age)}
              />
              {age}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="control-group">
        <legend>템플릿</legend>
        <div className="template-options">
          {templates.map((template) => (
            <label
              key={template.value}
              className={`template-option ${settings.template === template.value ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="template"
                value={template.value}
                checked={settings.template === template.value}
                onChange={() => update('template', template.value)}
              />
              <span className="template-check" aria-hidden="true" />
              <span>
                <strong>{template.title}</strong>
                <small>{template.description}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="option-grid">
        <fieldset className="control-group compact">
          <legend>글자 크기</legend>
          <div className="segmented two-up">
            <label className={settings.letterSize === 'large' ? 'selected' : ''}>
              <input
                type="radio"
                name="letterSize"
                checked={settings.letterSize === 'large'}
                onChange={() => update('letterSize', 'large')}
              />
              크게
            </label>
            <label className={settings.letterSize === 'normal' ? 'selected' : ''}>
              <input
                type="radio"
                name="letterSize"
                checked={settings.letterSize === 'normal'}
                onChange={() => update('letterSize', 'normal')}
              />
              보통
            </label>
          </div>
        </fieldset>

        <fieldset className="control-group compact">
          <legend>반복 줄 수</legend>
          <div className="segmented two-up">
            {([3, 5] as const).map((count) => (
              <label key={count} className={settings.repeatRows === count ? 'selected' : ''}>
                <input
                  type="radio"
                  name="repeatRows"
                  checked={settings.repeatRows === count}
                  onChange={() => update('repeatRows', count)}
                />
                {count}줄
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="switch-list">
        <label className="switch-row">
          <span>
            <strong>빈칸 연습 포함</strong>
            <small>혼자 써 보는 줄을 추가해요</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={settings.includeBlank}
            onChange={(event) => update('includeBlank', event.target.checked)}
          />
        </label>
        <label className="switch-row">
          <span>
            <strong>칭찬 문구 포함</strong>
            <small>학습지 아래에 응원을 담아요</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={settings.includePraise}
            onChange={(event) => update('includePraise', event.target.checked)}
          />
        </label>
      </div>

      <div className="action-buttons">
        <button className="primary-button" type="button" onClick={onDownload} disabled={isDownloading}>
          {isDownloading ? 'PDF 만드는 중…' : 'PDF 다운로드'}
        </button>
        <button className="secondary-button" type="button" onClick={onPrint}>
          인쇄하기
        </button>
      </div>
    </section>
  )
}
