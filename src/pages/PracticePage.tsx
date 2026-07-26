import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import PracticeCanvas from '../components/PracticeCanvas'
import type { PracticeCanvasHandle } from '../components/PracticeCanvas'
import Seo from '../components/Seo'
import { parsePracticeItems } from '../practice/parser'
import { scorePractice } from '../practice/scoring'
import {
  PRACTICE_PROGRESS_KEY,
  WORKSHEET_PREFILL_KEY,
  loadPracticeConfig,
  savePracticeConfig,
} from '../practice/session'
import {
  calculateStreak,
  createSessionRecord,
  deletePracticeRecords,
  getBestScoresByItem,
  getRecentSevenDays,
  loadPracticeRecords,
  savePracticeSession,
} from '../practice/storage'
import type {
  PracticeItemResult,
  PracticeScore,
  PracticeSessionConfig,
  PracticeSessionRecord,
} from '../practice/types'

const defaultConfig: PracticeSessionConfig = {
  rawText: 'ㄱ\n가\n사과\n김민준',
  displayMode: 'faint',
  progressMode: 'character',
}

type PracticeView = 'setup' | 'practice' | 'complete' | 'history'

interface SavedProgress {
  config: PracticeSessionConfig
  currentIndex: number
  results: Array<PracticeItemResult | null>
}

function getTodayKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function scoreLabel(score: number) {
  if (score >= 90) return '아주 좋아요'
  if (score >= 75) return '잘했어요'
  if (score >= 55) return '조금만 더'
  return '천천히 다시 해봐요'
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
  const parsed = parsePracticeItems(config.rawText, config.progressMode)
  return (
    <section className="practice-setup-page" aria-labelledby="practice-setup-title">
      <div className="practice-setup-card">
        <p className="eyebrow">화면에서 바로 연습</p>
        <h1 id="practice-setup-title">연습할 내용을 입력해 주세요</h1>
        <p>손가락, 펜 또는 마우스로 따라 쓰고 브라우저에서 참고 점수를 확인할 수 있어요.</p>
        <label htmlFor="practice-direct-input">연습 내용</label>
        <textarea
          id="practice-direct-input"
          value={config.rawText}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange({ ...config, rawText: event.target.value })}
          rows={6}
          placeholder={'ㄱ\n가\n사과\n김민준'}
        />

        <fieldset className="practice-setup-fieldset">
          <legend>표시 방식</legend>
          <div className="segmented practice-display-options">
            {([
              ['faint', '흐린 글자'],
              ['dotted', '점선 글자'],
              ['independent', '혼자 쓰기'],
            ] as const).map(([value, label]) => (
              <label key={value} className={config.displayMode === value ? 'selected' : ''}>
                <input
                  type="radio"
                  name="directDisplayMode"
                  checked={config.displayMode === value}
                  onChange={() => onChange({ ...config, displayMode: value })}
                />
                <strong>{label}</strong>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="practice-setup-fieldset">
          <legend>진행 방식</legend>
          <div className="segmented two-up">
            <label className={config.progressMode === 'character' ? 'selected' : ''}>
              <input
                type="radio"
                name="directProgressMode"
                checked={config.progressMode === 'character'}
                onChange={() => onChange({ ...config, progressMode: 'character' })}
              />
              <strong>한 글자씩</strong>
            </label>
            <label className={config.progressMode === 'line' ? 'selected' : ''}>
              <input
                type="radio"
                name="directProgressMode"
                checked={config.progressMode === 'line'}
                onChange={() => onChange({ ...config, progressMode: 'line' })}
              />
              <strong>입력한 줄 그대로</strong>
            </label>
          </div>
        </fieldset>

        <div className="practice-setup-summary">
          <strong>{parsed.items.length}개 항목</strong>
          <span>예상 약 {parsed.estimatedMinutes}분</span>
        </div>
        {parsed.truncated && <p className="limit-notice">앞의 10개 항목만 연습에 사용해요.</p>}
        <button className="primary-button practice-start-button" type="button" onClick={onStart} disabled={!parsed.items.length}>
          화면 연습 시작하기
        </button>
      </div>
    </section>
  )
}

function ScoreCard({
  item,
  result,
  latestScore,
  isTodayBest,
  onRetry,
  onNext,
  isLast,
}: {
  item: string
  result: PracticeItemResult
  latestScore: PracticeScore
  isTodayBest: boolean
  onRetry: () => void
  onNext: () => void
  isLast: boolean
}) {
  const breakdown = latestScore
  return (
    <section className="practice-score-card" aria-live="polite" aria-labelledby="score-card-title">
      <div className="score-card-heading">
        <div>
          <span>현재 글자</span>
          <h2 id="score-card-title">{item}</h2>
        </div>
        <div className="total-score">
          <strong>{latestScore.total}</strong><span>점</span>
          <small>{scoreLabel(latestScore.total)}</small>
        </div>
      </div>
      <div className="best-score-line">
        <strong>최고 점수 {result.bestScore}점</strong>
        <span>첫 점수 {result.firstScore}점 · {result.attempts}번 시도</span>
        {isTodayBest && <em>오늘 이 글자의 최고점이에요</em>}
      </div>
      <dl className="score-breakdown">
        <div><dt>모양 일치도</dt><dd>{breakdown.shape} / 50</dd></div>
        <div><dt>크기와 위치</dt><dd>{breakdown.sizePosition} / 20</dd></div>
        <div><dt>완성도</dt><dd>{breakdown.completion} / 20</dd></div>
        <div><dt>선 안정성</dt><dd>{breakdown.stability} / 10</dd></div>
      </dl>
      <div className="practice-feedback">
        {latestScore.feedback.map((message) => <p key={message}>{message}</p>)}
      </div>
      <p className="score-disclaimer">이 점수는 화면 따라쓰기 연습을 돕기 위한 참고 점수예요.</p>
      <div className="practice-result-actions">
        <button type="button" className="secondary-button" onClick={onRetry}>다시 쓰기</button>
        <button type="button" className="primary-button" onClick={onNext}>{isLast ? '연습 마치기' : '다음 글자'}</button>
      </div>
    </section>
  )
}

function HistoryView({ onBack }: { onBack: () => void }) {
  const [records, setRecords] = useState(() => loadPracticeRecords())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const today = getTodayKey()
  const recentDays = getRecentSevenDays(records)
  const bestScores = getBestScoresByItem(records)
  const todayCount = records.filter((record) => record.date === today).length

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
        <article><span>오늘 연습</span><strong>{todayCount}회</strong></article>
        <article><span>연속 연습일</span><strong>{calculateStreak(records)}일</strong></article>
        <article><span>저장된 세션</span><strong>{records.length}개</strong></article>
      </div>

      <section className="recent-days-card">
        <h2>최근 7일 연습일</h2>
        <div className="recent-days" aria-label="최근 7일 연습 여부">
          {recentDays.map((day) => (
            <div key={day.date} className={day.practiced ? 'practiced' : ''}>
              <span>{day.date.slice(5)}</span>
              <strong>{day.practiced ? '연습함' : '쉬는 날'}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="history-list-card">
        <h2>최근 세션</h2>
        {records.length ? (
          <div className="history-session-list">
            {records.slice(0, 10).map((record) => (
              <article key={record.id}>
                <div><strong>{record.items.map((item) => item.item).join(' · ')}</strong><span>{new Date(record.createdAt).toLocaleString('ko-KR')}</span></div>
                <div><strong>평균 {record.average}점</strong><span>{record.totalAttempts}번 시도</span></div>
              </article>
            ))}
          </div>
        ) : <p className="empty-history">아직 저장된 연습 기록이 없어요.</p>}
      </section>

      <section className="history-list-card">
        <h2>글자별 최고점</h2>
        {bestScores.length ? (
          <div className="best-item-grid">
            {bestScores.slice(0, 20).map(([item, score]) => <div key={item}><strong>{item}</strong><span>{score}점</span></div>)}
          </div>
        ) : <p className="empty-history">연습을 마치면 글자별 최고점이 표시돼요.</p>}
      </section>

      <button type="button" className="danger-button" onClick={() => setShowDeleteConfirm(true)} disabled={!records.length}>전체 기록 삭제</button>
      <p className="history-privacy-note">필기 이미지와 실제 획 좌표는 기록에 저장하지 않습니다. 브라우저 데이터를 삭제하면 이 기록도 사라질 수 있어요.</p>

      {showDeleteConfirm && (
        <div className="confirm-modal-backdrop" role="presentation">
          <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-records-title">
            <h2 id="delete-records-title">모든 연습 기록을 삭제할까요?</h2>
            <p>삭제한 점수 기록은 되돌릴 수 없어요.</p>
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
  onRetryWeak,
  onWorksheet,
  onRestart,
  onHistory,
}: {
  record: PracticeSessionRecord
  onRetryWeak: () => void
  onWorksheet: () => void
  onRestart: () => void
  onHistory: () => void
}) {
  const sortedByScore = [...record.items].sort((a, b) => a.bestScore - b.bestScore)
  const weak = sortedByScore.slice(0, 3)
  const improved = [...record.items].sort((a, b) => (b.bestScore - b.firstScore) - (a.bestScore - a.firstScore))[0]
  return (
    <section className="practice-complete-page" aria-labelledby="complete-title">
      <div className="complete-celebration">
        <span aria-hidden="true">★</span>
        <p className="eyebrow">오늘 연습 완료</p>
        <h1 id="complete-title">끝까지 연습했어요!</h1>
        <p>처음 점수보다 좋아진 글자를 함께 찾아 칭찬해 주세요.</p>
      </div>

      <div className="complete-summary-grid">
        <article><span>오늘의 평균 점수</span><strong>{record.average}점</strong></article>
        <article><span>최고 점수</span><strong>{record.best}점</strong></article>
        <article><span>총 연습 글자 수</span><strong>{record.items.length}개</strong></article>
        <article><span>총 시도 횟수</span><strong>{record.totalAttempts}회</strong></article>
      </div>

      <section className="improvement-card">
        <h2>가장 많이 좋아진 글자</h2>
        {improved ? (
          <div><strong>{improved.item}</strong><span>첫 {improved.firstScore}점 → 최고 {improved.bestScore}점</span><em>+{improved.bestScore - improved.firstScore}점</em></div>
        ) : <p>이번 세션의 기록이 없어요.</p>}
      </section>

      <section className="weak-items-card">
        <h2>한 번 더 연습하면 좋은 글자</h2>
        <div>{weak.map((item) => <span key={item.item}><strong>{item.item}</strong>{item.bestScore}점</span>)}</div>
        <p>낮은 점수는 실패가 아니라 다음 연습 내용을 고르는 참고 값이에요.</p>
      </section>

      <section className="improvement-list-card">
        <h2>최초 점수와 최고 점수 차이</h2>
        <div>
          {record.items.map((item) => (
            <article key={item.item}>
              <strong>{item.item}</strong>
              <span>{item.firstScore}점 → {item.bestScore}점</span>
              <em>+{item.bestScore - item.firstScore}점</em>
            </article>
          ))}
        </div>
      </section>

      <div className="complete-actions">
        <button type="button" className="primary-button" onClick={onRetryWeak}>낮은 점수 글자 다시 연습</button>
        <button type="button" className="worksheet-link-button" onClick={onWorksheet}>이 글자들로 학습지 만들기</button>
        <button type="button" className="secondary-button" onClick={onRestart}>처음부터 새 연습</button>
        <button type="button" className="secondary-button" onClick={onHistory}>연습 기록 보기</button>
      </div>
      <p className="score-disclaimer">이 점수는 화면 따라쓰기 연습을 돕기 위한 참고 점수예요.</p>
      <div className="safe-ad-zone" aria-label="향후 광고 배치 가능 영역" />
    </section>
  )
}

export default function PracticePage() {
  const queryWantsHistory = new URLSearchParams(window.location.search).get('view') === 'history'
  const storedConfig = loadPracticeConfig()
  const [config, setConfig] = useState<PracticeSessionConfig>(storedConfig ?? defaultConfig)
  const [view, setView] = useState<PracticeView>(queryWantsHistory ? 'history' : storedConfig ? 'practice' : 'setup')
  const parsed = useMemo(() => parsePracticeItems(config.rawText, config.progressMode), [config])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<Array<PracticeItemResult | null>>(() => Array(parsed.items.length).fill(null))
  const [latestScore, setLatestScore] = useState<PracticeScore | null>(null)
  const [message, setMessage] = useState('')
  const [strokeCount, setStrokeCount] = useState(0)
  const [completedRecord, setCompletedRecord] = useState<PracticeSessionRecord | null>(null)
  const canvasRef = useRef<PracticeCanvasHandle>(null)
  const historicRecordsRef = useRef(loadPracticeRecords())

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PRACTICE_PROGRESS_KEY)
      if (!raw || view !== 'practice') return
      const saved = JSON.parse(raw) as SavedProgress
      if (saved.config.rawText !== config.rawText || saved.config.progressMode !== config.progressMode) return
      setCurrentIndex(Math.min(saved.currentIndex, Math.max(0, parsed.items.length - 1)))
      setResults(Array.from({ length: parsed.items.length }, (_, index) => saved.results[index] ?? null))
    } catch {
      sessionStorage.removeItem(PRACTICE_PROGRESS_KEY)
    }
  }, [])

  useEffect(() => {
    if (view !== 'practice') return
    const progress: SavedProgress = { config, currentIndex, results }
    sessionStorage.setItem(PRACTICE_PROGRESS_KEY, JSON.stringify(progress))
  }, [config, currentIndex, results, view])

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (view !== 'practice') return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeave)
    return () => window.removeEventListener('beforeunload', warnBeforeLeave)
  }, [view])

  const currentItem = parsed.items[currentIndex] ?? ''
  const currentResult = results[currentIndex]
  const isLast = currentIndex === parsed.items.length - 1
  const todayBestBeforeSession = useMemo(() => {
    const today = getTodayKey()
    const best = new Map<string, number>()
    historicRecordsRef.current.filter((record) => record.date === today).forEach((record) => record.items.forEach((item) => {
      best.set(item.item, Math.max(best.get(item.item) ?? 0, item.bestScore))
    }))
    return best
  }, [])

  const beginPractice = (nextConfig = config) => {
    const nextParsed = parsePracticeItems(nextConfig.rawText, nextConfig.progressMode)
    if (!nextParsed.items.length) return
    savePracticeConfig(nextConfig)
    sessionStorage.removeItem(PRACTICE_PROGRESS_KEY)
    setConfig(nextConfig)
    setResults(Array(nextParsed.items.length).fill(null))
    setCurrentIndex(0)
    setLatestScore(null)
    setMessage('')
    setCompletedRecord(null)
    setView('practice')
    window.history.replaceState(null, '', '/practice/')
  }

  const handleExit = () => {
    if (view === 'practice' && !window.confirm('현재 진행 상태가 사라질 수 있어요. 연습을 나갈까요?')) return
    window.location.href = '/'
  }

  const handleScore = () => {
    const strokes = canvasRef.current?.getStrokes() ?? []
    const score = scorePractice(currentItem, strokes)
    if (!score) {
      setMessage('먼저 글자를 써주세요.')
      return
    }
    const previous = results[currentIndex]
    const nextResult: PracticeItemResult = previous
      ? {
          ...previous,
          attempts: previous.attempts + 1,
          bestScore: Math.max(previous.bestScore, score.total),
          bestBreakdown: score.total >= previous.bestScore ? score : previous.bestBreakdown,
        }
      : {
          item: currentItem,
          firstScore: score.total,
          bestScore: score.total,
          attempts: 1,
          bestBreakdown: score,
        }
    setResults((current) => current.map((item, index) => index === currentIndex ? nextResult : item))
    setLatestScore(score)
    setMessage('')
  }

  const handleRetry = () => {
    canvasRef.current?.clear()
    setLatestScore(null)
    setMessage('')
  }

  const finishSession = (finalResults: Array<PracticeItemResult | null>) => {
    const validResults = finalResults.filter((item): item is PracticeItemResult => Boolean(item))
    const record = createSessionRecord(validResults)
    savePracticeSession(record)
    sessionStorage.removeItem(PRACTICE_PROGRESS_KEY)
    setCompletedRecord(record)
    setView('complete')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNext = () => {
    if (!currentResult) return
    if (isLast) {
      finishSession(results)
      return
    }
    setCurrentIndex((index) => index + 1)
    setLatestScore(null)
    setMessage('')
    setStrokeCount(0)
    window.setTimeout(() => canvasRef.current?.clear(), 0)
  }

  const weakItems = completedRecord
    ? [...completedRecord.items].sort((a, b) => a.bestScore - b.bestScore).slice(0, 3).map((item) => item.item)
    : []

  const handleRetryWeak = () => {
    const rawText = weakItems.join('\n')
    beginPractice({ ...config, rawText, progressMode: 'line' })
  }

  const handleWorksheet = () => {
    const rawWords = weakItems.join('\n') || completedRecord?.items.map((item) => item.item).join('\n') || ''
    sessionStorage.setItem(WORKSHEET_PREFILL_KEY, JSON.stringify({ rawWords, practiceMode: 'trace' }))
    window.location.href = '/'
  }

  if (view === 'history') {
    return (
      <>
        <Seo title="화면 연습 기록" description="현재 브라우저에 저장된 최근 한글 화면 연습 점수와 연속 연습일을 확인하세요." path="/practice" noIndex />
        <HistoryView onBack={() => completedRecord ? setView('complete') : storedConfig ? setView('practice') : setView('setup')} />
      </>
    )
  }

  if (view === 'setup') {
    return (
      <>
        <Seo title="화면 한글 따라쓰기 연습" description="손가락, 펜, 마우스로 한글을 따라 쓰고 브라우저에서 참고 점수를 확인하세요." path="/practice" />
        <SetupView config={config} onChange={setConfig} onStart={() => beginPractice(config)} />
      </>
    )
  }

  if (view === 'complete' && completedRecord) {
    return (
      <>
        <Seo title="화면 연습 완료" description="오늘의 화면 한글 따라쓰기 연습 결과를 확인하세요." path="/practice" noIndex />
        <CompleteView
          record={completedRecord}
          onRetryWeak={handleRetryWeak}
          onWorksheet={handleWorksheet}
          onRestart={() => {
            sessionStorage.removeItem(PRACTICE_PROGRESS_KEY)
            setConfig(defaultConfig)
            setView('setup')
            window.history.replaceState(null, '', '/practice/')
          }}
          onHistory={() => setView('history')}
        />
      </>
    )
  }

  const progress = parsed.items.length ? ((currentIndex + 1) / parsed.items.length) * 100 : 0
  const isTodayBest = Boolean(currentResult && currentResult.bestScore >= (todayBestBeforeSession.get(currentItem) ?? 0))

  return (
    <>
      <Seo title={`${currentItem || '한글'} 화면 따라쓰기 연습`} description="화면에서 한글을 따라 쓰고 규칙 기반 참고 점수를 확인하세요." path="/practice" noIndex />
      <section className="practice-session-page" aria-label="화면 한글 따라쓰기 연습">
        <header className="practice-session-header">
          <button type="button" className="exit-practice-button" onClick={handleExit}>나가기</button>
          <div className="practice-progress-info">
            <strong>{currentIndex + 1} / {parsed.items.length}</strong>
            <div className="practice-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button type="button" className="history-shortcut" onClick={() => setView('history')}>기록</button>
        </header>

        <div className="practice-workspace">
          <div className="practice-item-heading">
            <span>{config.displayMode === 'independent' ? '위 글자를 보고 써 보세요' : '기준 글자를 천천히 따라 써 보세요'}</span>
            <h1>{currentItem}</h1>
          </div>

          <div className="canvas-safe-zone">
            <PracticeCanvas
              key={`${currentIndex}-${currentItem}`}
              ref={canvasRef}
              item={currentItem}
              displayMode={config.displayMode}
              onStrokeChange={(count) => {
                setStrokeCount(count)
                if (latestScore) setLatestScore(null)
              }}
            />
          </div>

          <div className="practice-canvas-actions" aria-label="필기 도구">
            <button type="button" onClick={() => canvasRef.current?.undo()} disabled={!strokeCount}>한 획 되돌리기</button>
            <button type="button" onClick={() => { canvasRef.current?.clear(); setLatestScore(null); setMessage('') }} disabled={!strokeCount}>모두 지우기</button>
            <button type="button" className="score-button" onClick={handleScore}>채점하기</button>
          </div>
          {message && <p className="practice-message" role="alert">{message}</p>}

          {latestScore && currentResult && (
            <ScoreCard
              item={currentItem}
              result={currentResult}
              latestScore={latestScore}
              isTodayBest={isTodayBest}
              onRetry={handleRetry}
              onNext={handleNext}
              isLast={isLast}
            />
          )}
        </div>
      </section>
    </>
  )
}
