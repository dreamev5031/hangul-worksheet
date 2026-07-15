import type { WorksheetSettings } from '../types'
import { parseWords } from '../utils/parseWords'

interface WorksheetControlsProps {
  settings: WorksheetSettings
  onChange: (next: WorksheetSettings) => void
  onDownload: () => void
  onPrint: () => void
  isDownloading: boolean
}

const quickInputGroups = [
  { label: '기본 자음', items: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] },
  { label: '기본 모음', items: ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'] },
  { label: '가나다', items: ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하'] },
  { label: '쉬운 단어', items: ['사과', '나비', '고양이', '토끼', '우유'] },
]

const templates: Array<{
  value: WorksheetSettings['template']
  title: string
  description: string
}> = [
  { value: 'letter', title: '글자 연습', description: '자음·모음·한 글자를 크게 써요' },
  { value: 'word', title: '단어 연습', description: '단어를 보고 따라 써요' },
  { value: 'sentence', title: '이름/문장 연습', description: '이름이나 짧은 문장을 또박또박 써요' },
]

const practiceModes: Array<{
  value: WorksheetSettings['practiceMode']
  title: string
  description: string
}> = [
  { value: 'trace', title: '따라쓰기 중심', description: '모든 줄을 흐린 글자로 안내해요' },
  { value: 'balanced', title: '반반', description: '따라쓰기와 혼자쓰기를 함께 해요' },
  { value: 'independent', title: '혼자쓰기 중심', description: '첫 줄만 보고 나머지는 스스로 써요' },
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

  const addQuickInput = (item: string) => {
    const currentItems = parseWords(settings.rawWords)
    if (currentItems.includes(item)) return
    update('rawWords', [...currentItems, item].join('\n'))
  }

  return (
    <section className="controls-card no-print" aria-labelledby="controls-title">
      <div className="section-heading">
        <span className="step-number">1</span>
        <div>
          <h2 id="controls-title">맞춤 학습지 만들기</h2>
          <p>연습할 내용을 자유롭게 입력해 주세요.</p>
        </div>
      </div>

      <div className="control-group core-input-group">
        <label htmlFor="words">연습할 글자나 단어를 입력하세요</label>
        <p className="input-description" id="words-description">
          자음, 모음, 한 글자, 단어, 아이 이름을 모두 입력할 수 있어요.
        </p>
        <textarea
          id="words"
          aria-describedby="words-description words-hint"
          value={settings.rawWords}
          onChange={(event) => update('rawWords', event.target.value)}
          placeholder={'ㄱ, ㄴ, ㄷ\n가, 나, 다\n공룡, 사과, 김민준'}
          rows={5}
        />
        <p className="field-hint" id="words-hint">
          예: ㄱ, ㄴ, ㄷ / 가, 나, 다 / 공룡, 사과, 김민준 · 줄바꿈이나 쉼표로 나눠 주세요.
        </p>
      </div>

      <section className="quick-input-panel" aria-labelledby="quick-input-title">
        <div className="quick-input-heading">
          <h3 id="quick-input-title">빠른 입력</h3>
          <p>버튼을 누르면 입력 목록에 바로 추가돼요.</p>
        </div>
        <div className="quick-input-groups">
          {quickInputGroups.map((group) => (
            <div className="quick-input-group" key={group.label}>
              <h4>{group.label}</h4>
              <div className="quick-input-chips">
                {group.items.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => addQuickInput(item)}
                    aria-label={`${group.label} ${item} 추가`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="name-input-tip">
          <strong>아이 이름</strong>은 위 입력창에 직접 적어 주세요. 입력한 이름은 저장되지 않아요.
        </p>
      </section>

      <fieldset className="control-group">
        <legend>학습지 유형</legend>
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
          <legend>줄 수</legend>
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

      <fieldset className="control-group practice-mode-group">
        <legend>연습 방식</legend>
        <div className="segmented practice-mode-options">
          {practiceModes.map((mode) => (
            <label key={mode.value} className={settings.practiceMode === mode.value ? 'selected' : ''}>
              <input
                type="radio"
                name="practiceMode"
                checked={settings.practiceMode === mode.value}
                onChange={() => update('practiceMode', mode.value)}
              />
              <strong>{mode.title}</strong>
              <small>{mode.description}</small>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="switch-list">
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
