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

const letterSizes: Array<{
  value: WorksheetSettings['letterSize']
  title: string
  description: string
}> = [
  { value: 'xlarge', title: '아주 크게', description: '처음 쓰는 아이' },
  { value: 'large', title: '크게', description: '기본 추천' },
  { value: 'normal', title: '보통', description: '단어·문장 연습' },
]

const practiceModes: Array<{
  value: WorksheetSettings['practiceMode']
  title: string
  description: string
}> = [
  { value: 'trace', title: '따라쓰기 많이', description: '글자를 보며 써요' },
  { value: 'balanced', title: '반반', description: '보고 쓴 뒤 혼자 써요' },
  { value: 'independent', title: '빈칸 많이', description: '첫 줄만 보고 써요' },
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
          <p>연습할 내용을 입력하면 바로 만들어져요.</p>
        </div>
      </div>

      <div className="control-group core-input-group">
        <label htmlFor="words">연습할 글자나 단어를 입력하세요</label>
        <p className="input-description" id="words-description">
          자음, 모음, 한 글자, 단어, 아이 이름과 짧은 문장을 입력할 수 있어요.
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
          줄바꿈이나 쉼표로 나눠 주세요. 문장은 띄어쓰기를 그대로 반영해요.
        </p>
      </div>

      <section className="quick-input-panel" aria-labelledby="quick-input-title">
        <div className="quick-input-heading">
          <h3 id="quick-input-title">빠른 입력</h3>
          <p>누르면 입력창에 추가돼요.</p>
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
          <strong>아이 이름</strong>은 입력창에 직접 적어 주세요. 입력 내용은 저장되지 않아요.
        </p>
      </section>

      <section className="settings-section output-settings" aria-labelledby="output-settings-title">
        <h3 id="output-settings-title">출력 설정</h3>

        <fieldset className="control-group compact">
          <legend>글자 크기</legend>
          <div className="segmented size-options">
            {letterSizes.map((size) => (
              <label key={size.value} className={settings.letterSize === size.value ? 'selected' : ''}>
                <input
                  type="radio"
                  name="letterSize"
                  checked={settings.letterSize === size.value}
                  onChange={() => update('letterSize', size.value)}
                />
                <strong>{size.title}</strong>
                <small>{size.description}</small>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="control-group compact practice-mode-group">
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

        <fieldset className="control-group compact rows-setting">
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
      </section>

      <section className="settings-section additional-settings" aria-labelledby="additional-settings-title">
        <h3 id="additional-settings-title">추가 설정</h3>
        <div className="switch-list additional-switches">
          <label className="switch-row">
            <span><strong>이름칸 표시</strong></span>
            <input
              type="checkbox"
              role="switch"
              checked={settings.showNameField}
              onChange={(event) => update('showNameField', event.target.checked)}
            />
          </label>
          <label className="switch-row">
            <span><strong>날짜칸 표시</strong></span>
            <input
              type="checkbox"
              role="switch"
              checked={settings.showDateField}
              onChange={(event) => update('showDateField', event.target.checked)}
            />
          </label>
          <label className="switch-row">
            <span><strong>빈칸 연습 포함</strong></span>
            <input
              type="checkbox"
              role="switch"
              checked={settings.includeBlank}
              onChange={(event) => update('includeBlank', event.target.checked)}
            />
          </label>
          <label className="switch-row">
            <span><strong>칭찬 문구 포함</strong></span>
            <input
              type="checkbox"
              role="switch"
              checked={settings.includePraise}
              onChange={(event) => update('includePraise', event.target.checked)}
            />
          </label>
        </div>
      </section>

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
