import { useMemo, useRef, useState } from 'react'
import AdPlaceholder from '../components/AdPlaceholder'
import Seo from '../components/Seo'
import WorksheetControls from '../components/WorksheetControls'
import WorksheetPreview from '../components/WorksheetPreview'
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

export default function HomePage() {
  const [settings, setSettings] = useState(initialSettings)
  const [isDownloading, setIsDownloading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const words = useMemo(() => parseWords(settings.rawWords), [settings.rawWords])

  const handleDownload = async () => {
    if (!previewRef.current || isDownloading) return
    setIsDownloading(true)
    try {
      await downloadWorksheetPdf(previewRef.current)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      <Seo
        title="자유 입력 맞춤 한글 학습지 만들기"
        description="자음, 모음, 한 글자, 단어, 아이 이름과 짧은 문장을 자유롭게 입력해 A4 한글 학습지를 만들고 PDF로 저장하거나 인쇄하세요."
        path="/"
      />

      <section className="hero no-print">
        <p className="eyebrow">부모를 위한 맞춤 한글 학습 도구</p>
        <h1>원하는 글자로<br /><em>맞춤 학습지</em>를 만들어요.</h1>
        <p>
          자음, 모음, 한 글자부터 좋아하는 단어와 아이 이름까지<br className="mobile-break" />
          자유롭게 입력하고 바로 인쇄할 수 있어요.
        </p>
        <div className="privacy-note" role="note">
          <strong>개인정보를 저장하지 않아요.</strong>
          <span>입력한 이름과 단어는 서버로 전송되지 않으며, 현재 브라우저에서 학습지를 만드는 데만 사용됩니다.</span>
        </div>
      </section>

      <AdPlaceholder className="home-top-ad" />

      <section className="tool-section" aria-label="한글 학습지 만들기 도구">
        <div className="app-layout">
          <WorksheetControls
            settings={settings}
            onChange={setSettings}
            onDownload={handleDownload}
            onPrint={() => window.print()}
            isDownloading={isDownloading}
          />
          <WorksheetPreview ref={previewRef} settings={settings} words={words} />
        </div>
      </section>

      <AdPlaceholder className="home-tool-ad" />

      <article className="home-content no-print" aria-labelledby="home-guide-title">
        <header className="content-intro">
          <p className="eyebrow">부모님을 위한 활용 안내</p>
          <h2 id="home-guide-title">짧고 즐거운 한글 쓰기 시간을 만들어보세요</h2>
          <p>학습지는 많이 쓰는 것보다 아이가 집중할 수 있는 만큼 반복하는 것이 중요합니다. 아래 안내를 참고해 아이의 속도에 맞춰 활용해 주세요.</p>
        </header>

        <div className="info-grid">
          <section className="info-card">
            <span className="info-number">01</span>
            <h3>어떤 부모에게 좋은가요?</h3>
            <p>시중 학습지보다 아이가 배우고 싶은 자음과 모음, 이름, 가족 호칭, 좋아하는 동물처럼 익숙한 내용을 직접 골라 연습시키고 싶은 부모에게 적합합니다.</p>
          </section>
          <section className="info-card">
            <span className="info-number">02</span>
            <h3>어떻게 사용하나요?</h3>
            <p>연습할 자음, 모음, 글자나 단어를 입력하고 글자 크기, 연습 방식, 줄 수를 고르세요. 따라쓰기와 혼자쓰기의 비율을 조절하면 아이에게 맞는 단계별 연습이 됩니다.</p>
          </section>
          <section className="info-card">
            <span className="info-number">03</span>
            <h3>입력 종류별 추천 사용법</h3>
            <p>처음에는 자음·모음이나 한 글자를 크게 연습하고, 익숙해지면 쉬운 단어와 아이 이름을 넣어 보세요. 짧은 문장은 혼자쓰기 비율을 천천히 늘리는 것이 좋습니다.</p>
          </section>
          <section className="info-card">
            <span className="info-number">04</span>
            <h3>출력 전 확인할 점</h3>
            <p>미리보기에서 글자, 단어와 이름의 철자를 확인하고 인쇄 설정은 A4 세로, 배율 100% 또는 실제 크기를 권장합니다. 브라우저 머리글과 바닥글을 끄면 더 깔끔합니다.</p>
          </section>
        </div>

        <section className="privacy-section">
          <div>
            <p className="eyebrow">입력 정보 보호</p>
            <h3>아이 이름은 이 기기 안에서만 사용돼요</h3>
          </div>
          <p>현재 서비스는 회원가입, 로그인, 쿠키 추적, 데이터베이스 저장 기능이 없습니다. 입력한 글자, 단어와 이름은 PDF를 만들거나 인쇄 미리보기를 표시할 때 브라우저 안에서만 처리됩니다.</p>
          <a href="/privacy/">개인정보 처리방침 자세히 보기</a>
        </section>

        <div className="content-links">
          <a href="/guide/">한글쓰기 사용 가이드 보기</a>
          <a href="/faq/">자주 묻는 질문 확인하기</a>
        </div>
      </article>
    </>
  )
}
