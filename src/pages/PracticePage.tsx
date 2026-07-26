import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import PracticeCanvas from '../components/PracticeCanvas'
import PracticeSessionControls from '../components/PracticeSessionControls'
import PracticeSessionHeader from '../components/PracticeSessionHeader'
import Seo from '../components/Seo'
import { createAudioFeedbackController } from '../practice/audioFeedback'
import { calculatePracticeLayout } from '../practice/layout'
import { parsePracticeItems } from '../practice/parser'
import {
  WORKSHEET_PREFILL_KEY,
  applyStrokeOutcome,
  createPracticeSessionState,
  getRetriedItems,
  loadPracticeConfig,
  restartCurrentCharacter,
  savePracticeConfig,
} from '../practice/session'
import { generateCharacterStrokes } from '../practice/syllableLayout'
import {
  calculateStreak,
  createSessionRecord,
  deletePracticeRecords,
  getFrequentRetriedItems,
  getTodayCompletedCount,
  getTotalCompletedCharacters,
  loadPracticeRecords,
  loadSoundEnabled,
  savePracticeSession,
  saveSoundEnabled,
} from '../practice/storage'
import { validateStroke } from '../practice/strokeValidator'
import type {
  AudioFeedbackController,
  PracticePoint,
  PracticeSessionConfig,
  PracticeSessionRecordV2,
  PracticeSessionState,
} from '../practice/types'

const defaultConfig: PracticeSessionConfig = { rawText: 'ㄱ\n가\n사과\n김민준' }
type PracticeView = 'setup' | 'practice' | 'complete' | 'history'
type PracticePhase = 'writing' | 'stroke-success' | 'retry' | 'character-complete'

function formatDuration(durationMs: number): string {
  const seconds = Math.max(0, Math.round(durationMs / 1000))
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return minutes > 0 ? `${minutes}분 ${remainder}초` : `${remainder}초`
}

function SetupView({
  config,
  onChange,
  onStart,
}: {
  config: PracticeSessionConfig
  onChange: (config: PracticeSessionConfig) => void
  onStart: () => void
}) {
  const parsed = parsePracticeItems(config.rawText)
  return (
    <section className="practice-setup-page" aria-labelledby="practice-setup-title">
      <div className="practice-setup-card">
        <p className="eyebrow">한 획씩 따라쓰기</p>
        <h1 id="practice-setup-title">연습할 한글을 입력해 주세요</h1>
        <p>올바른 획순을 한 획씩 안내하고, 손을 떼면 현재 획을 자동으로 확인해요.</p>
        <label htmlFor="practice-direct-input">연습 내용</label>
        <textarea
          id="practice-direct-input"
          value={config.rawText}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange({ rawText: event.target.value })}
          rows={6}
          placeholder={'ㄱ\n가\n사과\n김민준'}
        />
        <div className="practice-setup-summary">
          <strong>{parsed.items.length}개 글자</strong>
          <span>예상 약 {parsed.estimatedMinutes}분</span>
        </div>
        {parsed.excluded.length > 0 && (
          <p className="limit-notice" role="status">
            화면 연습에서는 한글만 사용해요. 제외된 문자: {parsed.excluded.join(' ')}
          </p>
        )}
        {parsed.truncated && <p className="limit-notice">앞의 10개 글자만 연습에 사용해요.</p>}
        <button className="primary-button practice-start-button" type="button" onClick={onStart} disabled={!parsed.items.length}>
          획순 연습 시작하기
        </button>
      </div>
    </section>
  )
}

function HistoryView({ onBack }: { onBack: () => void }) {
  const [records, setRecords] = useState(() => loadPracticeRecords())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const frequent = getFrequentRetriedItems(records)

  const handleDelete = () => {
    deletePracticeRecords()
    setRecords([])
    setShowDeleteConfirm(false)
  }

  return (
    <section className="practice-history-page" aria-labelledby="history-title">
      <div className="practice-history-header">
        <button type="button" className="text-button" onClick={onBack}>← 돌아가기</button>
        <div>
          <p className="eyebrow">현재 브라우저에만 저장</p>
          <h1 id="history-title">연습 기록</h1>
        </div>
      </div>

      <div className="history-summary-grid">
        <article><span>오늘 완료한 연습</span><strong>{getTodayCompletedCount(records)}회</strong></article>
        <article><span>연속 연습일</span><strong>{calculateStreak(records)}일</strong></article>
        <article><span>총 완성 글자</span><strong>{getTotalCompletedCharacters(records)}개</strong></article>
      </div>

      <section className="history-list-card">
        <h2>최근 세션</h2>
        {records.length ? (
          <div className="history-session-list">
            {records.slice(0, 10).map((record) => (
              <article key={record.id}>
                <div>
                  <strong>{record.items.join(' · ')}</strong>
                  <span>{new Date(record.completedAt).toLocaleString('ko-KR')}</span>
                </div>
                <div>
                  <strong>{record.completedCount}글자 완성</strong>
                  <span>다시 쓰기 {record.totalRetries}회 · {formatDuration(record.durationMs)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="empty-history">아직 저장된 완료 기록이 없어요.</p>}
      </section>

      <section className="history-list-card">
        <h2>자주 다시 쓴 글자</h2>
        {frequent.length ? (
          <div className="retry-item-grid">
            {frequent.slice(0, 20).map(([item, count]) => <div key={item}><strong>{item}</strong><span>{count}회</span></div>)}
          </div>
        ) : <p className="empty-history">다시 쓴 글자가 생기면 여기에 표시돼요.</p>}
      </section>

      <button type="button" className="danger-button" onClick={() => setShowDeleteConfirm(true)} disabled={!records.length}>전체 기록 삭제</button>
      <p className="history-privacy-note">날짜, 완성한 글자와 재시도 횟수만 저장합니다. 필기 이미지와 실제 획 좌표는 저장하지 않습니다.</p>

      {showDeleteConfirm && (
        <div className="confirm-modal-backdrop" role="presentation">
          <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-records-title">
            <h2 id="delete-records-title">모든 연습 기록을 삭제할까요?</h2>
            <p>삭제한 완료·재시도 기록은 되돌릴 수 없어요.</p>
            <div>
              <button type="button" className="secondary-button" onClick={() => setShowDeleteConfirm(false)}>취소</button>
              <button type="button" className="danger-button" onClick={handleDelete}>삭제하기</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function CompleteView({
  record,
  streak,
  onRepeatAll,
  onRepeatRetried,
  onWorksheet,
  onNewPractice,
  onHistory,
}: {
  record: PracticeSessionRecordV2
  streak: number
  onRepeatAll: () => void
  onRepeatRetried: () => void
  onWorksheet: (scope: 'all' | 'retried') => void
  onNewPractice: () => void
  onHistory: () => void
}) {
  const [worksheetScope, setWorksheetScope] = useState<'all' | 'retried'>(record.retriedItems.length ? 'retried' : 'all')
  return (
    <section className="practice-complete-page" aria-labelledby="complete-title">
      <div className="complete-celebration">
        <span aria-hidden="true">★</span>
        <p className="eyebrow">오늘 연습 완료</p>
        <h1 id="complete-title">오늘 연습을 모두 마쳤어요!</h1>
        <p>한 획씩 끝까지 따라 쓴 과정을 함께 칭찬해 주세요.</p>
      </div>

      <div className="complete-summary-grid">
        <article><span>완성한 글자</span><strong>{record.completedCount}개</strong></article>
        <article><span>다시 써본 글자</span><strong>{record.retriedItems.length}개</strong></article>
        <article><span>총 다시 쓰기</span><strong>{record.totalRetries}회</strong></article>
        <article><span>연습 시간</span><strong>{formatDuration(record.durationMs)}</strong></article>
        <article><span>연속 연습일</span><strong>{streak}일</strong></article>
      </div>

      <section className="completed-items-card">
        <h2>완성한 글자</h2>
        <div>{record.items.map((item) => <span key={item}>{item}</span>)}</div>
      </section>

      <section className="completed-items-card">
        <h2>다시 써본 글자</h2>
        {record.retriedItems.length
          ? <div>{record.retriedItems.map((item) => <span key={item}>{item}</span>)}</div>
          : <p>모든 획을 한 번에 잘 따라 썼어요!</p>}
      </section>

      <fieldset className="worksheet-scope-card">
        <legend>인쇄 학습지에 넣을 글자</legend>
        <label><input type="radio" name="worksheetScope" checked={worksheetScope === 'all'} onChange={() => setWorksheetScope('all')} /> 전체 글자</label>
        <label><input type="radio" name="worksheetScope" checked={worksheetScope === 'retried'} onChange={() => setWorksheetScope('retried')} disabled={!record.retriedItems.length} /> 다시 써본 글자</label>
      </fieldset>

      <div className="complete-actions">
        <button type="button" className="primary-button" onClick={onRepeatAll}>한 번 더 연습하기</button>
        <button type="button" className="secondary-button" onClick={onRepeatRetried} disabled={!record.retriedItems.length}>다시 써본 글자만 연습하기</button>
        <button type="button" className="worksheet-link-button" onClick={() => onWorksheet(worksheetScope)}>이 글자들로 인쇄 학습지 만들기</button>
        <button type="button" className="secondary-button" onClick={onNewPractice}>새 연습 만들기</button>
        <button type="button" className="secondary-button" onClick={onHistory}>연습 기록 보기</button>
      </div>
      <div className="safe-ad-zone" aria-label="향후 광고 배치 가능 영역" />
    </section>
  )
}

export default function PracticePage() {
  const search = new URLSearchParams(window.location.search)
  const storedConfig = loadPracticeConfig() ?? defaultConfig
  const initialParsed = parsePracticeItems(storedConfig.rawText)
  const wantsHistory = search.get('view') === 'history'
  const wantsStart = search.get('start') === '1' && initialParsed.items.length > 0
  const [config, setConfig] = useState<PracticeSessionConfig>(storedConfig)
  const [view, setView] = useState<PracticeView>(wantsHistory ? 'history' : wantsStart ? 'practice' : 'setup')
  const [returnFromHistory, setReturnFromHistory] = useState<PracticeView>('setup')
  const [session, setSession] = useState<PracticeSessionState>(() => createPracticeSessionState(initialParsed.items))
  const [phase, setPhase] = useState<PracticePhase>('writing')
  const [visualCompletedCount, setVisualCompletedCount] = useState(0)
  const [failedStroke, setFailedStroke] = useState<PracticePoint[] | null>(null)
  const [guideReplayKey, setGuideReplayKey] = useState(0)
  const [statusMessage, setStatusMessage] = useState('시작점에서 화살표 방향으로 따라 써 보세요.')
  const [completedRecord, setCompletedRecord] = useState<PracticeSessionRecordV2 | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(() => loadSoundEnabled())
  const [canvasSide, setCanvasSide] = useState(() => calculatePracticeLayout({ width: window.innerWidth, height: window.innerHeight }).canvasSide)
  const audioRef = useRef<AudioFeedbackController | null>(null)
  const timerRef = useRef<number | null>(null)

  const parsed = useMemo(() => parsePracticeItems(config.rawText), [config.rawText])
  const currentItem = session.items[session.currentItemIndex] ?? ''
  const generatedCharacter = useMemo(() => generateCharacterStrokes(currentItem), [currentItem])

  useEffect(() => {
    audioRef.current = createAudioFeedbackController(!soundEnabled)
    return () => audioRef.current?.dispose()
  }, [])

  useEffect(() => {
    audioRef.current?.setMuted(!soundEnabled)
    saveSoundEnabled(soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    if (view !== 'practice') return
    document.body.classList.add('practice-session-active')
    const updateViewport = () => {
      const height = window.visualViewport?.height ?? window.innerHeight
      document.documentElement.style.setProperty('--practice-vh', `${height}px`)
      setCanvasSide(calculatePracticeLayout({ width: window.innerWidth, height }).canvasSide)
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    window.addEventListener('orientationchange', updateViewport)
    window.visualViewport?.addEventListener('resize', updateViewport)
    return () => {
      document.body.classList.remove('practice-session-active')
      document.documentElement.style.removeProperty('--practice-vh')
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('orientationchange', updateViewport)
      window.visualViewport?.removeEventListener('resize', updateViewport)
    }
  }, [view])

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
  }, [])

  useEffect(() => {
    setVisualCompletedCount(session.completedStrokeCount)
    setFailedStroke(null)
    setPhase('writing')
    setGuideReplayKey((value) => value + 1)
  }, [session.currentItemIndex])

  const beginPractice = (rawItems: string[]) => {
    if (!rawItems.length) return
    const nextConfig = { rawText: rawItems.join('\n') }
    savePracticeConfig(nextConfig)
    setConfig(nextConfig)
    setSession(createPracticeSessionState(rawItems))
    setPhase('writing')
    setVisualCompletedCount(0)
    setFailedStroke(null)
    setCompletedRecord(null)
    setStatusMessage('시작점에서 화살표 방향으로 따라 써 보세요.')
    setGuideReplayKey((value) => value + 1)
    setView('practice')
    window.history.replaceState(null, '', '/practice/')
  }

  const finishSession = (completedState: PracticeSessionState) => {
    const record = createSessionRecord(completedState)
    savePracticeSession(record)
    setCompletedRecord(record)
    audioRef.current?.play('session-complete')
    setView('complete')
    window.history.replaceState(null, '', '/practice/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStrokeEnd = (points: PracticePoint[]) => {
    if (phase !== 'writing' || !generatedCharacter) return
    const referenceStroke = generatedCharacter.strokes[session.currentStrokeIndex]
    if (!referenceStroke) return
    const validation = validateStroke(points, referenceStroke, session.currentStrokeRetryCount)
    if (!validation.accepted) {
      const nextState = applyStrokeOutcome(session, false, generatedCharacter.strokes.length)
      setSession(nextState)
      setFailedStroke(points)
      setPhase('retry')
      setStatusMessage('선을 따라 다시 써볼까요?')
      audioRef.current?.play('retry')
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        setFailedStroke(null)
        setPhase('writing')
        setGuideReplayKey((value) => value + 1)
      }, 320)
      return
    }

    const isLastStroke = session.currentStrokeIndex >= generatedCharacter.strokes.length - 1
    const nextState = applyStrokeOutcome(session, true, generatedCharacter.strokes.length)
    setVisualCompletedCount(session.completedStrokeCount + 1)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(18)

    if (!isLastStroke) {
      setPhase('stroke-success')
      setStatusMessage('좋아요! 다음 획을 따라 써 보세요.')
      audioRef.current?.play('stroke-success')
      timerRef.current = window.setTimeout(() => {
        setSession(nextState)
        setPhase('writing')
        setGuideReplayKey((value) => value + 1)
      }, 360)
      return
    }

    setPhase('character-complete')
    setStatusMessage('참 잘했어요!')
    audioRef.current?.play('character-complete')
    timerRef.current = window.setTimeout(() => {
      setSession(nextState)
      if (nextState.completed) {
        finishSession(nextState)
      } else {
        setPhase('writing')
        setStatusMessage('시작점에서 화살표 방향으로 따라 써 보세요.')
        setGuideReplayKey((value) => value + 1)
      }
    }, 860)
  }

  const handleHistory = () => {
    setReturnFromHistory(view)
    setView('history')
  }

  const handleWorksheet = (record: PracticeSessionRecordV2, scope: 'all' | 'retried') => {
    const selected = scope === 'retried' && record.retriedItems.length ? record.retriedItems : record.items
    sessionStorage.setItem(WORKSHEET_PREFILL_KEY, JSON.stringify({ rawWords: selected.join('\n'), practiceMode: 'trace' }))
    window.location.href = '/'
  }

  if (view === 'history') {
    return (
      <>
        <Seo title="획순 연습 기록" description="현재 브라우저에 저장된 한글 획순 연습 완료와 재시도 기록을 확인하세요." path="/practice" noIndex />
        <HistoryView onBack={() => setView(returnFromHistory)} />
      </>
    )
  }

  if (view === 'setup') {
    return (
      <>
        <Seo title="아이용 한글 획순 따라쓰기" description="올바른 한글 획순을 한 획씩 보고 손가락, 펜 또는 마우스로 따라 써 보세요." path="/practice" />
        <SetupView config={config} onChange={setConfig} onStart={() => beginPractice(parsed.items)} />
      </>
    )
  }

  if (view === 'complete' && completedRecord) {
    const records = loadPracticeRecords()
    return (
      <>
        <Seo title="획순 연습 완료" description="오늘 완성한 한글과 다시 써본 글자를 확인하세요." path="/practice" noIndex />
        <CompleteView
          record={completedRecord}
          streak={calculateStreak(records)}
          onRepeatAll={() => beginPractice(completedRecord.items)}
          onRepeatRetried={() => beginPractice(completedRecord.retriedItems)}
          onWorksheet={(scope) => handleWorksheet(completedRecord, scope)}
          onNewPractice={() => {
            setConfig(defaultConfig)
            setView('setup')
          }}
          onHistory={handleHistory}
        />
      </>
    )
  }

  if (!generatedCharacter) {
    return (
      <>
        <Seo title="한글 획순 따라쓰기" description="한글 획순 연습" path="/practice" noIndex />
        <section className="practice-setup-page"><div className="practice-setup-card"><h1>연습할 수 있는 한글이 없어요.</h1><button type="button" onClick={() => setView('setup')}>새로 입력하기</button></div></section>
      </>
    )
  }

  return (
    <>
      <Seo title={`${currentItem} 획순 따라쓰기`} description="현재 획을 따라 쓰고 손을 떼면 자동으로 다음 획으로 이동합니다." path="/practice" noIndex />
      <section className="practice-session-shell" aria-label="한글 획순 따라쓰기 집중 모드">
        <PracticeSessionHeader
          character={currentItem}
          currentIndex={session.currentItemIndex}
          totalItems={session.items.length}
          soundEnabled={soundEnabled}
          onExit={() => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current)
            setView('setup')
            window.history.replaceState(null, '', '/practice/')
          }}
          onToggleSound={() => setSoundEnabled((enabled) => !enabled)}
          onHistory={handleHistory}
        />

        <main className="canvas-stage">
          <div className="stroke-status-line">
            <strong>{currentItem}</strong>
            <span aria-label={`현재 ${session.currentStrokeIndex + 1}번째 획, 전체 ${generatedCharacter.strokes.length}획`}>
              {session.currentStrokeIndex + 1} / {generatedCharacter.strokes.length}획
            </span>
          </div>
          <div className={`stroke-canvas-frame phase-${phase}`} style={{ width: `${canvasSide}px`, height: `${canvasSide}px` }}>
            <PracticeCanvas
              character={generatedCharacter}
              currentStrokeIndex={session.currentStrokeIndex}
              completedStrokeCount={visualCompletedCount}
              retryCount={session.currentStrokeRetryCount}
              guideReplayKey={guideReplayKey}
              phase={phase}
              failedStroke={failedStroke}
              onInteractionStart={() => { void audioRef.current?.unlock() }}
              onStrokeEnd={handleStrokeEnd}
            />
            {phase === 'character-complete' && <div className="character-praise" aria-hidden="true">참 잘했어요!</div>}
          </div>
          <p className={`practice-live-message message-${phase}`} aria-live="polite">{statusMessage}</p>
        </main>

        <PracticeSessionControls
          onRestartCharacter={() => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current)
            setSession((current) => restartCurrentCharacter(current))
            setVisualCompletedCount(0)
            setFailedStroke(null)
            setPhase('writing')
            setStatusMessage('첫 획부터 다시 따라 써 보세요.')
            setGuideReplayKey((value) => value + 1)
          }}
          onReplayGuide={() => {
            setGuideReplayKey((value) => value + 1)
            setStatusMessage('빛나는 점과 화살표를 따라 써 보세요.')
          }}
        />
      </section>
    </>
  )
}
