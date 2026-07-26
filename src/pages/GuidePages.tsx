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
        title="한글쓰기 학습지와 화면 연습 사용 가이드"
        description="5세, 6세, 7세 아이에게 인쇄 학습지와 화면 따라쓰기를 짧고 즐겁게 활용하는 방법을 안내합니다."
        path="/guide"
      />
      <article className="content-page guide-page">
        <PageHeader
          eyebrow="부모를 위한 사용 가이드"
          title="한 번에 많이보다, 짧게 자주 연습해요"
          description="아이의 나이와 쓰기 경험에 맞춰 화면 연습과 인쇄 학습지를 부담 없이 이어가는 방법을 정리했습니다."
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
              <p>화면에서는 흐린 글자와 한 글자씩 진행을 사용하고, 손에 힘이 많이 들어가면 중간에 손을 털어 쉬게 해 주세요.</p>
            </article>
            <article>
              <span>6세</span>
              <h3>소리와 글자 연결하기</h3>
              <p>아이 이름과 좋아하는 단어 2~3개를 섞어 보세요. 단어를 먼저 함께 읽고, 첫소리를 말해 본 다음 흐린 글자를 따라 쓰면 소리와 글자 모양을 연결하는 데 도움이 됩니다.</p>
              <p>틀린 획을 계속 지우게 하기보다 화면에서 다시 쓰기를 한 번 선택하거나 다음 줄에서 천천히 다시 써 보도록 안내해 주세요.</p>
            </article>
            <article>
              <span>7세</span>
              <h3>빈칸에 스스로 써 보기</h3>
              <p>학교, 친구, 가방처럼 생활에서 자주 만나는 단어를 활용하세요. 따라쓰기와 빈칸 연습을 함께 사용하면 보고 쓰기에서 기억해 쓰기로 자연스럽게 넘어갈 수 있습니다.</p>
              <p>화면에서는 혼자 쓰기를 사용해 본 뒤 점수가 낮은 글자만 인쇄 학습지의 따라쓰기 많이 설정으로 이어가 보세요.</p>
            </article>
          </div>
          <p className="support-note">나이는 참고 기준입니다. 아이가 쓰기를 처음 시작했다면 실제 나이보다 쉬운 설정을 선택해도 괜찮습니다.</p>
        </section>

        <section>
          <h2>화면 연습 4단계</h2>
          <div className="steps-list">
            <div><span>1</span><p><strong>연습 내용 입력</strong>줄바꿈이나 쉼표로 글자와 단어를 입력합니다. 한 글자씩 모드에서는 공백과 중복을 제외하고 최대 10개를 사용합니다.</p></div>
            <div><span>2</span><p><strong>표시 방식 선택</strong>처음에는 흐린 글자, 익숙해지면 점선 글자, 마지막에는 참고 글자를 보고 혼자 쓰기를 선택해 보세요.</p></div>
            <div><span>3</span><p><strong>쓰고 다시 시도</strong>손가락, 스타일러스 또는 마우스로 쓴 뒤 채점합니다. 원하는 만큼 다시 쓰고 최고 점수를 남길 수 있습니다.</p></div>
            <div><span>4</span><p><strong>약한 글자 인쇄</strong>세션 완료 화면에서 낮은 점수 글자를 기존 A4 따라쓰기 학습지로 자동 연결합니다.</p></div>
          </div>
        </section>

        <AdPlaceholder className="article-ad" />

        <section>
          <h2>인쇄 학습지와 함께하는 4단계 활동</h2>
          <div className="steps-list">
            <div><span>1</span><p><strong>단어 고르기</strong>오늘 있었던 일이나 아이가 좋아하는 것에서 두세 단어를 함께 고릅니다.</p></div>
            <div><span>2</span><p><strong>소리 내어 읽기</strong>쓰기에 앞서 단어를 천천히 읽고 글자 수를 손가락으로 세어 봅니다.</p></div>
            <div><span>3</span><p><strong>따라 쓰기</strong>부모가 첫 글자를 한 번 보여준 뒤 아이가 흐린 글자를 따라 쓰도록 기다립니다.</p></div>
            <div><span>4</span><p><strong>좋았던 점 말하기</strong>“끝까지 썼구나”, “천천히 쓴 글자가 잘 보이네”처럼 구체적으로 칭찬합니다.</p></div>
          </div>
        </section>

        <section className="callout-section">
          <h2>참고 점수를 편안하게 활용하기</h2>
          <p>화면 점수는 기준 글자와 사용자 필기의 거리, 위치, 크기와 선 변화를 규칙으로 비교합니다. 교육기관의 공식 진단이나 정확한 획순 판정이 아닙니다. 다른 아이와 비교하지 말고 같은 글자의 첫 점수와 최고 점수 차이만 살펴보세요.</p>
        </section>

        <section className="callout-section">
          <h2>혼내지 않고 다시 시도하게 돕기</h2>
          <p>아이가 쓰기 싫어하거나 피곤해 보이면 그날은 한 글자나 한 줄만 쓰고 끝내도 됩니다. 잘된 글자 하나를 함께 찾고 다음에는 어떤 부분을 천천히 써 볼지 짧게 이야기해 주세요.</p>
        </section>

        <section>
          <h2>인쇄 후 안전하게 사용하기</h2>
          <p>책상과 의자 높이를 맞추고 종이가 미끄러지지 않도록 고정해 주세요. 연필을 지나치게 세게 쥐거나 손목을 꺾지 않는지 살펴보고, 통증을 호소하면 바로 활동을 멈춰야 합니다.</p>
          <p>입력한 이름과 단어, 화면 필기 이미지는 서버에 업로드되지 않습니다. 분석은 현재 브라우저에서 실행되고 완료 기록에는 점수와 시도 횟수만 저장됩니다.</p>
          <div className="content-links">
            <a href="/">연습 내용 만들기</a>
            <a href="/practice/">화면 연습 바로가기</a>
            <a href="/faq/">인쇄·화면 연습 질문 보기</a>
          </div>
        </section>
      </article>
    </>
  )
}

const faqItems = [
  {
    question: 'PDF가 저장되지 않아요.',
    answer: '브라우저의 다운로드 차단 표시가 있는지 확인하고 다운로드 권한을 허용한 뒤 다시 시도해 주세요. 모바일에서는 파일 앱 또는 브라우저 다운로드 목록에서 hangul-worksheet.pdf를 찾을 수 있습니다.',
  },
  {
    question: '인쇄할 때 학습지가 잘리거나 작게 나와요.',
    answer: '인쇄 설정에서 용지를 A4, 방향을 세로로 선택하고 배율은 100% 또는 실제 크기로 맞춰 주세요. 브라우저의 머리글과 바닥글 옵션을 끄면 불필요한 날짜와 주소가 출력되는 것을 막을 수 있습니다.',
  },
  {
    question: '아이 이름과 필기 내용이 서버에 저장되나요?',
    answer: '아니요. 입력한 이름과 단어, 필기 이미지와 실제 획 좌표는 서버로 전송하거나 연습 기록에 저장하지 않습니다. 화면 분석은 현재 브라우저에서 실행됩니다.',
  },
  {
    question: '화면 연습 기록에는 무엇이 저장되나요?',
    answer: '현재 브라우저에 날짜, 연습 항목, 최초·최고 점수, 시도 횟수, 세부 점수와 세션 평균만 저장됩니다. 기록 메뉴에서 전체 삭제할 수 있고 브라우저 데이터 삭제 시 함께 사라질 수 있습니다.',
  },
  {
    question: '점수가 아이의 한글 실력을 뜻하나요?',
    answer: '아니요. 기준 글자와 화면 필기의 모양·위치·완성도·선 안정성을 비교한 연습용 참고 값입니다. 공식 교육 진단, 발달 평가 또는 정확한 획순 판정이 아닙니다.',
  },
  {
    question: '모바일과 태블릿에서도 사용할 수 있나요?',
    answer: '네. 학습지 입력과 PDF 미리보기뿐 아니라 Pointer Events 기반 화면 필기도 손가락, 스타일러스와 마우스로 사용할 수 있습니다. 화면 회전 후에는 정규화된 좌표로 현재 필기를 다시 그립니다.',
  },
  {
    question: '화면 전체를 칠하면 높은 점수가 나오나요?',
    answer: '아니요. 사용자 선이 기준 허용 영역 안에 들어간 비율과 기준 글자 커버리지를 함께 계산하고 과도한 필기 면적과 낮은 정확도에 감점을 적용합니다.',
  },
  {
    question: '낮은 점수 글자로 학습지를 만들 수 있나요?',
    answer: '세션 완료 화면에서 “이 글자들로 학습지 만들기”를 누르면 최대 3개의 낮은 점수 글자가 기존 입력창에 들어가고 “따라쓰기 많이”가 기본 선택됩니다.',
  },
  {
    question: '무료로 사용할 수 있나요?',
    answer: '현재 학습지 만들기와 화면 연습 기능은 무료입니다. 향후 서비스 운영 방식이 바뀌는 경우 이용 전에 알기 쉽게 안내하겠습니다.',
  },
  {
    question: '몇 개의 단어를 한 번에 넣는 것이 좋나요?',
    answer: 'A4 한 장에는 2~4개 단어를 권장합니다. 화면 연습은 한 세션 최대 10개 항목을 사용하며 아이가 집중할 수 있는 분량으로 나누는 편이 좋습니다.',
  },
]

export function FaqPage() {
  return (
    <>
      <Seo
        title="자주 묻는 질문"
        description="한글 학습지 PDF, A4 인쇄, 화면 연습 점수, 브라우저 기록과 개인정보 처리 질문을 확인하세요."
        path="/faq"
      />
      <article className="content-page faq-page">
        <PageHeader
          eyebrow="자주 묻는 질문"
          title="인쇄 학습지와 화면 연습이 궁금할 때"
          description="PDF, 인쇄 설정, 캔버스 필기, 참고 점수와 브라우저 기록에 관한 답변을 모았습니다."
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
          <p>기기와 브라우저 종류, 문제가 발생한 기능을 적어 문의해 주세요. 아이의 개인정보나 필기 이미지는 보내지 않아도 됩니다.</p>
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
        description="요청한 페이지를 찾을 수 없습니다. 오늘의 한글 학습지 홈이나 화면 연습으로 이동해 주세요."
        path="/404"
        noIndex
      />
      <section className="not-found-page">
        <span>404</span>
        <h1>페이지를 찾을 수 없어요</h1>
        <p>주소가 바뀌었거나 입력한 주소가 정확하지 않을 수 있습니다.</p>
        <div className="content-links">
          <a href="/">학습지 만들기</a>
          <a href="/practice/">화면 연습</a>
          <a href="/guide/">사용 가이드 보기</a>
        </div>
      </section>
    </>
  )
}
