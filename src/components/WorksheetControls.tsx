import type { ChangeEvent } from 'react'
import type { WorksheetSettings } from '../types'
import { parsePracticeItems } from '../practice/parser'
import type { PracticeSessionConfig } from '../practice/types'

export type CreationMode = 'print' | 'screen'

interface WorksheetControlsProps {
  settings: WorksheetSettings
  onChange: (next: WorksheetSettings) => void
  creationMode: CreationMode
  onCreationModeChange: (mode: CreationMode) => void
  practiceConfig: PracticeSessionConfig
  onPracticeConfigChange: (next: PracticeSessionConfig) => void
  onStartPractice: () => void
  onDownload: () => void
  onPrint: () => void
  isDownloading: boolean
}

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
  creationMode,
  onCreationModeChange,
  practiceConfig,
  onPracticeConfigChange,
  onStartPractice,
  onDownload,
  onPrint,
  isDownloading,
}: WorksheetControlsProps) {
  const update = <K extends keyof WorksheetSettings>(
    key: K,
    value: WorksheetSettings[K],
  ) => onChange({ ...settings, [key]: value })

  const updatePractice = <K extends keyof PracticeSessionConfig>(
    key: K,
    value: PracticeSessionConfig[K],
  ) => onPracticeConfigChange({ ...practiceConfig, [key]: value })

  const parsedPractice = parsePracticeItems(settings.rawWords)

  return (
    <section className="controls-card no-print" aria-labelledby="controls-title">
      <div className="section-heading">
        <span className="step-number">1</span>
        <div>
          <h2 id="controls-title">연습 내용 만들기</h2>
          <p>연습할 내용을 입력하고 인쇄 또는 화면 연습을 선택하세요.</p>
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
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            update('rawWords', event.target.value)
            updatePractice('rawText', event.target.value)
          }}
          placeholder={'ㄱ, ㄴ, ㄷ\n가, 나, 다\n공룡, 사과, 김민준'}
          rows={5}
        />
        <div className="input-footer">
          <p className="field-hint" id="words-hint">
            예: ㄱ, ㄴ, ㄷ / 가, 나, 다 / 공룡, 사과, 김민준
          </p>
          <button
            className="clear-input-button"
            type="button"
            onClick={() => {
              update('rawWords', '')
              updatePractice('rawText', '')
            }}
            disabled={!settings.rawWords}
          >
            입력 지우기
          </button>
        </div>
      </div>

      <fieldset className="control-group compact creation-mode-group">
        <legend>연습 방법</legend>
        <div className="segmented two-up creation-mode-options">
          <label className={creationMode === 'print' ? 'selected' : ''}>
            <input
              type="radio"
              name="creationMode"
              checked={creationMode === 'print'}
              onChange={() => onCreationModeChange('print')}
            />
            <strong>인쇄 학습지</strong>
            <small>PDF 저장·인쇄</small>
          </label>
          <label className={creationMode === 'screen' ? 'selected' : ''}>
            <input
              type="radio"
              name="creationMode"
              checked={creationMode === 'screen'}
              onChange={() => onCreationModeChange('screen')}
            />
            <strong>화면에서 바로 연습</strong>
            <small>손가락·펜·마우스</small>
          </label>
        </div>
      </fieldset>

      {creationMode === 'print' ? (
        <>
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
                  onChange={(event: ChangeEvent<HTMLInputElement>) => update('showNameField', event.target.checked)}
                />
              </label>
              <label className="switch-row">
                <span><strong>날짜칸 표시</strong></span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={settings.showDateField}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => update('showDateField', event.target.checked)}
                />
              </label>
              <label className="switch-row">
                <span><strong>빈칸 연습 포함</strong></span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={settings.includeBlank}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => update('includeBlank', event.target.checked)}
                />
              </label>
              <label className="switch-row">
                <span><strong>칭찬 문구 포함</strong></span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={settings.includePraise}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => update('includePraise', event.target.checked)}
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
        </>
      ) : (
        <>
          <section className="settings-section screen-settings" aria-labelledby="screen-settings-title">
            <h3 id="screen-settings-title">화면 획순 연습</h3>
            <div className="stroke-order-summary">
              <strong>한 획씩 자동으로 진행해요</strong>
              <p>현재 획의 시작점과 방향을 보고 따라 쓰면 손을 떼는 순간 자동으로 확인합니다.</p>
              <dl>
                <div><dt>연습 글자</dt><dd>{parsedPractice.items.length}개</dd></div>
                <div><dt>진행</dt><dd>한 글자씩</dd></div>
              </dl>
            </div>
            {parsedPractice.excluded.length > 0 && (
              <p className="limit-notice" role="status">화면 연습에서 제외: {parsedPractice.excluded.join(' ')}</p>
            )}
            {parsedPractice.truncated && (
              <p className="limit-notice" role="status">연습 글자가 10개를 넘어 앞의 10개만 사용해요.</p>
            )}
          </section>

          <div className="action-buttons screen-action-buttons">
            <button
              className="primary-button"
              type="button"
              onClick={onStartPractice}
              disabled={parsedPractice.items.length === 0}
            >
              화면 연습 시작하기
            </button>
          </div>
        </>
      )}
    </section>
  )
}
