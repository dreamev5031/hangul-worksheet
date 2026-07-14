import { useMemo, useRef, useState } from 'react'
import AdPlaceholder from '../components/AdPlaceholder'
import Seo from '../components/Seo'
import WorksheetControls from '../components/WorksheetControls'
import WorksheetPreview from '../components/WorksheetPreview'
import type { WorksheetSettings } from '../types'
import { downloadWorksheetPdf } from '../utils/downloadPdf'
import { parseWords } from '../utils/parseWords'

const recommendedWords = ['공룡', '사과', '학교', '자동차', '고양이', '엄마', '아빠']

const initialSettings: WorksheetSettings = {
  rawWords: '공룡\n사과\n김민준',
  age: '6세',
  template: 'basic',
  letterSize: 'large',
  repeatRows: 3,
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

  const addRecommendedWord = (word: string) => {
    const currentWords = parseWords(settings.rawWords)
    if (currentWords.includes(word)) return
    setSettings({ ...settings, rawWords: [...currentWords, word].join('\n') })
  }

  return (
    <>
      <Seo
        title="아이 맞춤 한글 따라쓰기 학습지 만들기"
        description="아이 이름과 좋아하는 단어를 입력해 A4 한글 따라쓰기 학습지를 만들고 PDF로 저장하거나 인쇄하세요. 입력 내용은 브라우저 안에서만 처리됩니다."
        path="/"
      />

      <section className="hero no-print">
        <p className="eyebrow">부모를 위한 맞춤 한글 학습 도구</p>
        <h1>좋아하는 단어로<br /><em>한글 쓰기</em>가 즐거워져요.</h1>
        <p>
          아이 이름이나 좋아하는 단어를 입력하면<br className="mobile-break" />
          바로 인쇄할 수 있는 따라쓰기 학습지를 만들 수 있어요.
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

        <section className="recommendations no-print" aria-labelledby="recommendation-title">
          <div>
            <p className="eyebrow">단어가 떠오르지 않나요?</p>
            <h2 id="recommendation-title">이런 단어로 만들어보세요</h2>
          </div>
          <div className="word-chips">
            {recommendedWords.map((word) => (
              <button type="button" key={word} onClick={() => addRecommendedWord(word)}>
                + {word}
              </button>
            ))}
          </div>
        </section>
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
            <p>시중 학습지보다 아이 이름, 가족 호칭, 좋아하는 동물처럼 익숙한 단어로 연습시키고 싶은 부모에게 적합합니다. 별도 가입 없이 필요한 날 바로 만들 수 있습니다.</p>
          </section>
          <section className="info-card">
            <span className="info-number">02</span>
            <h3>어떻게 사용하나요?</h3>
            <p>단어를 2~4개 정도 입력하고 아이에게 맞는 글자 크기와 줄 수를 고르세요. 먼저 흐린 글자를 따라 쓴 뒤, 빈칸에 혼자 써 보게 하면 자연스럽게 단계별 연습이 됩니다.</p>
          </section>
          <section className="info-card">
            <span className="info-number">03</span>
            <h3>나이별 추천 사용법</h3>
            <p>5세는 큰 글씨 한두 단어, 6세는 익숙한 단어 세 개, 7세는 이름과 생활 단어를 섞어 보세요. 나이는 기준일 뿐이며 아이가 편안해하는 분량을 우선해 주세요.</p>
          </section>
          <section className="info-card">
            <span className="info-number">04</span>
            <h3>출력 전 확인할 점</h3>
            <p>미리보기에서 단어와 이름의 철자를 확인하고 인쇄 설정은 A4 세로, 배율 100% 또는 실제 크기를 권장합니다. 브라우저 머리글과 바닥글을 끄면 더 깔끔합니다.</p>
          </section>
        </div>

        <section className="privacy-section">
          <div>
            <p className="eyebrow">입력 정보 보호</p>
            <h3>아이 이름은 이 기기 안에서만 사용돼요</h3>
          </div>
          <p>현재 서비스는 회원가입, 로그인, 쿠키 추적, 데이터베이스 저장 기능이 없습니다. 입력한 단어와 이름은 PDF를 만들거나 인쇄 미리보기를 표시할 때 브라우저 안에서만 처리됩니다.</p>
          <a href="/privacy/">개인정보 처리방침 자세히 보기</a>
        </section>

        <div className="content-links">
          <a href="/guide/">연령별 사용 가이드 보기</a>
          <a href="/faq/">자주 묻는 질문 확인하기</a>
        </div>
      </article>
    </>
  )
}
