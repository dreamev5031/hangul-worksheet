import AdPlaceholder from '../components/AdPlaceholder'
import Seo from '../components/Seo'

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="page-hero">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}

export function GuidePage() {
  return (
    <>
      <Seo
        title="한글쓰기 학습지 사용 가이드"
        description="5세, 6세, 7세 아이에게 한글 따라쓰기 학습지를 활용하는 방법과 짧은 반복, 칭찬 중심 지도법을 안내합니다."
        path="/guide"
      />
      <article className="content-page guide-page">
        <PageHeader
          eyebrow="부모를 위한 사용 가이드"
          title="한 번에 많이보다, 짧게 자주 연습해요"
          description="아이의 나이와 쓰기 경험에 맞춰 부담 없이 한글 학습지를 활용하는 방법을 정리했습니다."
        />

        <section className="guide-summary">
          <h2>시작하기 전에 기억할 세 가지</h2>
          <ol>
            <li><strong>익숙한 단어부터</strong><span>아이 이름, 가족, 좋아하는 음식이나 동물처럼 이미 알고 있는 단어를 선택하세요.</span></li>
            <li><strong>하루 5~10분</strong><span>집중이 흐트러지기 전에 마무리하고, 더 하고 싶어 할 때 다음 활동을 약속해 주세요.</span></li>
            <li><strong>결과보다 과정 칭찬</strong><span>모양이 완벽하지 않아도 천천히 따라 쓴 노력과 끝까지 해 본 경험을 칭찬해 주세요.</span></li>
          </ol>
        </section>

        <section>
          <h2>나이별 추천 사용법</h2>
          <div className="age-guide-grid">
            <article>
              <span>5세</span>
              <h3>큰 글씨 한두 단어</h3>
              <p>연필을 잡고 선을 따라가는 경험에 초점을 맞춰 주세요. 두 글자 정도의 익숙한 단어를 큰글씨 템플릿으로 만들고, 3줄만 연습해도 충분합니다.</p>
              <p>손에 힘이 많이 들어가면 굵은 연필이나 삼각 연필을 사용하고 중간에 손을 털어 쉬게 해 주세요.</p>
            </article>
            <article>
              <span>6세</span>
              <h3>소리와 글자 연결하기</h3>
              <p>아이 이름과 좋아하는 단어 2~3개를 섞어 보세요. 단어를 먼저 함께 읽고, 첫소리를 말해 본 다음 흐린 글자를 따라 쓰면 소리와 글자 모양을 연결하는 데 도움이 됩니다.</p>
              <p>틀린 획을 지우게 하기보다 한 줄을 마친 뒤 다음 줄에서 천천히 다시 써 보도록 안내해 주세요.</p>
            </article>
            <article>
              <span>7세</span>
              <h3>빈칸에 스스로 써 보기</h3>
              <p>학교, 친구, 가방처럼 생활에서 자주 만나는 단어를 활용하세요. 따라쓰기 3줄과 빈칸 연습을 함께 사용하면 보고 쓰기에서 기억해 쓰기로 자연스럽게 넘어갈 수 있습니다.</p>
              <p>글자 크기를 보통으로 바꾸더라도 칸을 채우는 정확성보다 읽을 수 있게 또박또박 쓰는 경험을 우선해 주세요.</p>
            </article>
          </div>
          <p className="support-note">나이는 참고 기준입니다. 아이가 쓰기를 처음 시작했다면 실제 나이보다 쉬운 설정을 선택해도 괜찮습니다.</p>
        </section>

        <AdPlaceholder className="article-ad" />

        <section>
          <h2>학습지와 함께하는 4단계 활동</h2>
          <div className="steps-list">
            <div><span>1</span><p><strong>단어 고르기</strong>오늘 있었던 일이나 아이가 좋아하는 것에서 두세 단어를 함께 고릅니다.</p></div>
            <div><span>2</span><p><strong>소리 내어 읽기</strong>쓰기에 앞서 단어를 천천히 읽고 글자 수를 손가락으로 세어 봅니다.</p></div>
            <div><span>3</span><p><strong>따라 쓰기</strong>부모가 첫 글자를 한 번 보여준 뒤 아이가 흐린 글자를 따라 쓰도록 기다립니다.</p></div>
            <div><span>4</span><p><strong>좋았던 점 말하기</strong>“끝까지 썼구나”, “천천히 쓴 글자가 잘 보이네”처럼 구체적으로 칭찬합니다.</p></div>
          </div>
        </section>

        <section className="callout-section">
          <h2>혼내지 않고 다시 시도하게 돕기</h2>
          <p>아이가 쓰기 싫어하거나 피곤해 보이면 그날은 한 줄만 쓰고 끝내도 됩니다. 틀린 글자를 반복해서 지우게 하면 쓰기 자체를 부담스럽게 느낄 수 있습니다. 잘된 글자 하나를 함께 찾고 다음에는 어떤 부분을 천천히 써 볼지 짧게 이야기해 주세요.</p>
        </section>

        <section>
          <h2>인쇄 후 안전하게 사용하기</h2>
          <p>책상과 의자 높이를 맞추고 종이가 미끄러지지 않도록 고정해 주세요. 연필을 지나치게 세게 쥐거나 손목을 꺾지 않는지 살펴보고, 통증을 호소하면 바로 활동을 멈춰야 합니다.</p>
          <div className="content-links">
            <a href="/">학습지 만들러 가기</a>
            <a href="/faq/">인쇄·PDF 질문 보기</a>
          </div>
        </section>
      </article>
    </>
  )
}

const faqItems = [
  {
    question: 'PDF가 저장되지 않아요.',
    answer: '브라우저의 다운로드 차단 표시가 있는지 확인하고, 다운로드 권한을 허용한 뒤 다시 시도해 주세요. 저장 공간이 충분한지도 확인해 주세요. 모바일에서는 파일 앱 또는 브라우저 다운로드 목록에서 hangul-worksheet.pdf를 찾을 수 있습니다.',
  },
  {
    question: '인쇄할 때 학습지가 잘리거나 작게 나와요.',
    answer: '인쇄 설정에서 용지를 A4, 방향을 세로로 선택하고 배율은 100% 또는 실제 크기로 맞춰 주세요. 브라우저의 머리글과 바닥글 옵션을 끄면 불필요한 날짜와 주소가 출력되는 것을 막을 수 있습니다.',
  },
  {
    question: '아이 이름을 입력하면 저장되나요?',
    answer: '아니요. 현재 입력한 이름과 단어는 사용자의 브라우저 안에서 미리보기와 PDF를 만드는 데만 사용됩니다. 서버로 전송하거나 데이터베이스에 저장하지 않으며, 새로고침하면 입력 내용이 사라집니다.',
  },
  {
    question: '모바일에서도 사용할 수 있나요?',
    answer: '네. 스마트폰과 태블릿에서도 단어를 입력하고 미리보기를 확인할 수 있습니다. PDF 저장과 인쇄 기능은 기기 및 브라우저 설정에 따라 동작 방식이 조금 다를 수 있습니다.',
  },
  {
    question: '무료로 사용할 수 있나요?',
    answer: '현재 MVP의 학습지 만들기 기능은 무료입니다. 향후 서비스 운영 방식이 바뀌는 경우 이용 전에 알기 쉽게 안내하겠습니다.',
  },
  {
    question: '몇 개의 단어를 한 번에 넣는 것이 좋나요?',
    answer: 'A4 한 장에는 2~4개 단어를 권장합니다. 단어가 너무 많으면 글씨와 연습 줄이 작아질 수 있습니다. 아이가 집중할 수 있는 분량으로 나누어 여러 장 만드는 편이 좋습니다.',
  },
]

export function FaqPage() {
  return (
    <>
      <Seo
        title="자주 묻는 질문"
        description="한글 학습지 PDF 저장, A4 인쇄, 아이 이름 저장 여부, 모바일 이용과 무료 사용에 관한 답변을 확인하세요."
        path="/faq"
      />
      <article className="content-page faq-page">
        <PageHeader
          eyebrow="자주 묻는 질문"
          title="학습지를 만들고 출력할 때 궁금한 점"
          description="PDF 저장과 인쇄 설정, 입력 정보 보호에 관한 자주 묻는 질문을 모았습니다."
        />

        <section className="faq-list" aria-label="질문과 답변">
          {faqItems.map((item, index) => (
            <details key={item.question} open={index === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>

        <AdPlaceholder className="article-ad" />

        <section className="callout-section">
          <h2>원하는 답을 찾지 못했나요?</h2>
          <p>기기와 브라우저 종류, 문제가 발생한 기능을 적어 문의해 주세요. 아이의 개인정보는 보내지 않아도 됩니다.</p>
          <a href="/contact/">문의 방법 확인하기</a>
        </section>
      </article>
    </>
  )
}

export function NotFoundPage() {
  return (
    <>
      <Seo
        title="페이지를 찾을 수 없습니다"
        description="요청한 페이지를 찾을 수 없습니다. 오늘의 한글 학습지 홈이나 사용 가이드로 이동해 주세요."
        path="/404"
        noIndex
      />
      <section className="not-found-page">
        <span>404</span>
        <h1>페이지를 찾을 수 없어요</h1>
        <p>주소가 바뀌었거나 입력한 주소가 정확하지 않을 수 있습니다.</p>
        <div className="content-links">
          <a href="/">학습지 만들기</a>
          <a href="/guide/">사용 가이드 보기</a>
        </div>
      </section>
    </>
  )
}
