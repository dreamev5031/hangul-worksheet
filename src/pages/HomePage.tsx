import { useEffect, useMemo, useRef, useState } from 'react'
import Seo from '../components/Seo'
import PracticePreview from '../components/PracticePreview'
import WorksheetControls from '../components/WorksheetControls'
import type { CreationMode } from '../components/WorksheetControls'
import WorksheetPreview from '../components/WorksheetPreview'
import type { PracticeSessionConfig } from '../practice/types'
import { savePracticeConfig, WORKSHEET_PREFILL_KEY } from '../practice/session'
import type { WorksheetSettings } from '../types'
import { downloadWorksheetPdf } from '../utils/downloadPdf'
import { parseWords } from '../utils/parseWords'

const initialSettings: WorksheetSettings = {
  rawWords: 'ㄱ\n가\n사과\n김민준',
  letterSize: 'large',
  practiceMode: 'balanced',
  repeatRows: 3,
  showNameField: true,
  showDateField: true,
  includeBlank: true,
  includePraise: true,
}

const initialPracticeConfig: PracticeSessionConfig = { rawText: initialSettings.rawWords }

export default function HomePage() {
  const [settings, setSettings] = useState(initialSettings)
  const [creationMode, setCreationMode] = useState<CreationMode>('print')
  const [practiceConfig, setPracticeConfig] = useState(initialPracticeConfig)
  const [isDownloading, setIsDownloading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const toolRef = useRef<HTMLElement>(null)
  const words = useMemo(() => parseWords(settings.rawWords), [settings.rawWords])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(WORKSHEET_PREFILL_KEY)
      if (!raw) return
      const prefill = JSON.parse(raw) as { rawWords?: string; practiceMode?: WorksheetSettings['practiceMode'] }
      if (!prefill.rawWords) return
      setSettings((current) => ({
        ...current,
        rawWords: prefill.rawWords ?? current.rawWords,
        practiceMode: prefill.practiceMode ?? 'trace',
      }))
      setPracticeConfig((current) => ({ ...current, rawText: prefill.rawWords ?? current.rawText }))
      setCreationMode('print')
      sessionStorage.removeItem(WORKSHEET_PREFILL_KEY)
      window.setTimeout(() => toolRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    } catch {
      sessionStorage.removeItem(WORKSHEET_PREFILL_KEY)
    }
  }, [])

  const handleDownload = async () => {
    if (!previewRef.current || isDownloading) return
    setIsDownloading(true)
    try {
      await downloadWorksheetPdf(previewRef.current)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleStartPractice = () => {
    const config = { ...practiceConfig, rawText: settings.rawWords }
    savePracticeConfig(config)
    window.location.href = '/practice/?start=1'
  }

  return (
    <>
      <Seo
        title="자유 입력 맞춤 한글 학습지와 화면 연습"
        description="자음, 모음, 한 글자와 이름을 입력해 A4 한글 학습지를 만들거나 올바른 획순을 한 획씩 따라 써 보세요."
        path="/"
      />

      <section className="hero no-print">
        <p className="eyebrow">부모를 위한 맞춤 한글 학습 도구</p>
        <h1>원하는 글자로<br /><em>맞춤 학습지</em>를 만들고, 화면에서 바로 연습해요.</h1>
        <p>
          자음, 모음, 한 글자부터 좋아하는 단어와 아이 이름까지<br className="mobile-break" />
          자유롭게 입력하고 인쇄하거나 손가락으로 따라 써 보세요.
        </p>
        <div className="privacy-note" role="note">
          <strong>입력 내용은 서버로 보내지 않아요.</strong>
          <span>화면 연습 기록은 현재 기기의 브라우저에만 저장되며 기록 메뉴에서 언제든지 지울 수 있어요.</span>
        </div>
      </section>

      <section ref={toolRef} className="tool-section" aria-label="한글 연습 내용 만들기 도구">
        <div className="app-layout">
          <WorksheetControls
            settings={settings}
            onChange={setSettings}
            creationMode={creationMode}
            onCreationModeChange={setCreationMode}
            practiceConfig={{ ...practiceConfig, rawText: settings.rawWords }}
            onPracticeConfigChange={setPracticeConfig}
            onStartPractice={handleStartPractice}
            onDownload={handleDownload}
            onPrint={() => window.print()}
            isDownloading={isDownloading}
          />
          {creationMode === 'print' ? (
            <WorksheetPreview ref={previewRef} settings={settings} words={words} />
          ) : (
            <PracticePreview rawText={settings.rawWords} />
          )}
        </div>
      </section>

      <article className="home-content no-print" aria-labelledby="home-guide-title">
        <header className="content-intro">
          <p className="eyebrow">부모님을 위한 활용 안내</p>
          <h2 id="home-guide-title">화면에서 획순을 익히고, 인쇄 학습지로 이어가세요</h2>
          <p>화면 연습은 올바른 획순을 한 획씩 안내하고 손을 떼는 순간 현재 획을 자동으로 확인합니다. 다시 써본 글자는 세션이 끝난 뒤 기존 A4 학습지에 연결할 수 있습니다.</p>
        </header>

        <div className="info-grid">
          <section className="info-card">
            <span className="info-number">01</span>
            <h3>어떤 부모에게 좋은가요?</h3>
            <p>시중 학습지보다 아이가 배우고 싶은 자음과 모음, 이름, 가족 호칭, 좋아하는 동물처럼 익숙한 내용을 직접 골라 연습시키고 싶은 부모에게 적합합니다.</p>
          </section>
          <section className="info-card">
            <span className="info-number">02</span>
            <h3>화면 연습은 어떻게 하나요?</h3>
            <p>연습할 내용을 입력하고 화면 연습을 선택하세요. 손가락, 스타일러스 또는 마우스로 현재 획을 따라 쓰면 맞는 획은 고정되고 다음 획으로 자동 이동합니다.</p>
          </section>
          <section className="info-card">
            <span className="info-number">03</span>
            <h3>재도전은 어떻게 도와주나요?</h3>
            <p>같은 획이 어려우면 시작점과 방향 안내가 더 또렷해지고 허용 범위도 넓어집니다. 실패 횟수나 점수는 아이 화면에 보여주지 않습니다.</p>
          </section>
          <section className="info-card">
            <span className="info-number">04</span>
            <h3>인쇄 학습지로 이어가기</h3>
            <p>세션 완료 화면에서 전체 글자 또는 다시 써본 글자를 선택하면 기존 학습지 입력창과 따라쓰기 많이 설정이 자동으로 적용됩니다.</p>
          </section>
        </div>

        <section className="privacy-section">
          <div>
            <p className="eyebrow">입력 정보 보호</p>
            <h3>연습과 분석은 이 브라우저 안에서 실행돼요</h3>
          </div>
          <p>입력한 이름과 단어, 필기 이미지는 서버에 업로드되지 않습니다. 연습 기록에는 날짜, 완성한 글자와 재시도 횟수만 저장되며 브라우저 데이터를 삭제하면 함께 사라질 수 있습니다.</p>
          <a href="/privacy/">개인정보 처리방침 자세히 보기</a>
        </section>

        <div className="content-links">
          <a href="/practice/">화면 연습 바로가기</a>
          <a href="/guide/">한글쓰기 사용 가이드 보기</a>
          <a href="/faq/">자주 묻는 질문 확인하기</a>
        </div>
      </article>
    </>
  )
}
