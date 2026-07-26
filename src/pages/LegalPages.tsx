import Seo from '../components/Seo'
import { CONTACT_EMAIL } from '../config'

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="page-hero">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}

export function AboutPage() {
  return (
    <>
      <Seo
        title="사이트 소개"
        description="오늘의 한글 학습지가 맞춤 인쇄 학습지와 브라우저 화면 따라쓰기 연습을 어떻게 연결하는지 안내합니다."
        path="/about"
      />
      <article className="content-page">
        <PageHeader
          eyebrow="사이트 소개"
          title="아이에게 익숙한 글자로 시작하는 한글 쓰기"
          description="오늘의 한글 학습지는 부모가 아이의 이름과 관심사를 활용해 인쇄 학습지를 만들고 화면에서 바로 따라 쓰게 돕는 무료 도구입니다."
        />

        <section>
          <h2>인쇄와 화면 연습을 한곳에서</h2>
          <p>아이마다 좋아하는 단어와 한글을 익히는 속도는 다릅니다. 공룡을 좋아하는 아이에게는 공룡 이름을, 가족에게 관심이 많은 아이에게는 가족 이름을 활용하면 낯선 교재보다 편안하게 쓰기 연습을 시작할 수 있습니다.</p>
          <p>입력한 내용으로 기존 A4 학습지를 PDF로 저장하거나 인쇄할 수 있고, 같은 내용을 손가락·스타일러스·마우스로 화면에서 따라 쓸 수도 있습니다. 화면 연습이 끝나면 점수가 낮은 글자를 기존 인쇄 학습지 입력창으로 자동 연결합니다.</p>
        </section>

        <section>
          <h2>우리가 중요하게 생각하는 것</h2>
          <div className="value-list">
            <div><strong>간단함</strong><p>회원가입이나 설치 없이 필요한 순간 바로 사용할 수 있습니다.</p></div>
            <div><strong>아이의 속도</strong><p>많이 쓰게 하기보다 짧고 즐겁게 반복하는 활동을 권합니다.</p></div>
            <div><strong>부모 중심</strong><p>점수는 평가보다 다음 연습 내용을 고르는 참고 정보로 안내합니다.</p></div>
            <div><strong>정보 보호</strong><p>입력 내용과 필기 이미지는 서버로 보내지 않고 분석도 현재 브라우저에서 실행합니다.</p></div>
          </div>
        </section>

        <section className="callout-section">
          <h2>어떤 정보가 기기에 남나요?</h2>
          <p>입력한 이름과 단어는 서버로 전송되지 않습니다. 화면 연습을 완료하면 날짜, 연습 항목, 첫 점수, 최고 점수, 시도 횟수와 세부 점수만 현재 브라우저에 저장됩니다. 필기 이미지와 실제 획 좌표는 기록에 저장하지 않습니다.</p>
          <a href="/privacy/">개인정보 처리방침 확인하기</a>
        </section>

        <section>
          <h2>편안하게 활용하려면</h2>
          <p>아이의 나이보다 현재 쓰기 경험과 집중 시간을 기준으로 분량을 조절해 주세요. 화면 점수는 교육기관의 공식 진단이 아니므로 숫자보다 처음과 최고 점수의 차이, 끝까지 다시 시도한 과정을 함께 칭찬해 주세요.</p>
          <a className="text-link" href="/guide/">한글쓰기 사용 가이드 보기</a>
        </section>
      </article>
    </>
  )
}

export function PrivacyPage() {
  return (
    <>
      <Seo
        title="개인정보 처리방침"
        description="입력한 이름과 단어, 화면 필기 분석과 브라우저 연습 기록의 처리 방식을 안내합니다."
        path="/privacy"
      />
      <article className="content-page policy-page">
        <PageHeader
          eyebrow="개인정보 처리방침"
          title="입력과 필기 분석은 브라우저 안에서 처리됩니다"
          description="입력한 이름과 단어, 필기 이미지는 운영자 서버에 업로드하지 않습니다."
        />
        <p className="policy-date">시행일 및 최종 수정일: 2026년 7월 26일</p>

        <section>
          <h2>1. 직접 수집하는 개인정보</h2>
          <p>오늘의 한글 학습지는 회원가입, 로그인, 문의 양식, 결제 기능을 제공하지 않으며 이름, 연락처, 계정 정보 같은 개인정보를 사용자별 서버 기록으로 직접 수집하지 않습니다.</p>
        </section>

        <section>
          <h2>2. 입력한 이름과 단어의 처리</h2>
          <p>학습지 생성기와 화면 연습에 입력한 이름과 단어는 현재 브라우저에서 미리보기, PDF, 인쇄 화면과 연습 항목을 만드는 데 사용됩니다. 해당 내용은 운영자 서버나 데이터베이스로 전송되지 않습니다.</p>
        </section>

        <section>
          <h2>3. 화면 필기와 점수 분석</h2>
          <p>필기 좌표와 캔버스 이미지는 외부 LLM, 이미지 분석 API 또는 운영자 서버로 보내지 않습니다. 기준 글자 마스크와 사용자 필기 마스크의 비교, 위치·크기·완성도·선 안정성 계산은 현재 브라우저에서 실행됩니다.</p>
          <p>필기 이미지, 캔버스 PNG와 실제 획 좌표 원본은 연습 기록에 저장하지 않습니다. 점수는 화면 연습을 돕기 위한 참고 값이며 전문 교육 또는 의료 진단이 아닙니다.</p>
        </section>

        <section>
          <h2>4. 브라우저에 저장되는 연습 기록</h2>
          <p>화면 연습을 완료하면 날짜, 연습 항목, 최초 점수, 최고 점수, 시도 횟수, 세부 점수, 세션 평균과 연속 연습일 계산에 필요한 정보가 버전이 지정된 브라우저 저장소에만 보관됩니다.</p>
          <p>연습 기록 화면의 전체 기록 삭제 메뉴에서 언제든지 지울 수 있습니다. 브라우저 데이터 삭제, 시크릿 모드 종료, 기기 교체 또는 저장 공간 정리 시 기록이 사라질 수 있으며 다른 기기와 동기화되지 않습니다.</p>
        </section>

        <section>
          <h2>5. 광고 서비스와 쿠키</h2>
          <p>사이트 운영을 위해 Google AdSense와 같은 제3자 광고 서비스를 사용할 수 있습니다. 광고 서비스가 활성화된 경우 Google과 광고 파트너는 광고 제공, 빈도 제한, 부정 사용 방지와 광고 효과 측정을 위해 쿠키 또는 유사 기술을 사용할 수 있습니다.</p>
          <p>광고는 필기 캔버스와 되돌리기·지우기·채점·다음 글자처럼 아이가 반복해서 누르는 영역 주변에는 배치하지 않습니다. 맞춤 광고 설정은 해당 광고 서비스가 제공하는 관리 화면에서 변경할 수 있습니다.</p>
        </section>

        <section>
          <h2>6. 접속 정보와 호스팅</h2>
          <p>Cloudflare Pages와 같은 호스팅 사업자는 서비스 보안과 안정적인 제공을 위해 IP 주소, 브라우저 종류와 접속 시각 같은 기술 정보를 처리할 수 있습니다. 이러한 처리는 각 사업자의 개인정보 처리방침과 보안 정책을 따릅니다.</p>
        </section>

        <section>
          <h2>7. 어린이 관련 안내와 문의</h2>
          <p>이 사이트의 실제 사용자는 부모 또는 보호자입니다. 아이의 연락처, 사진, 주소나 민감한 정보는 입력하지 말고 학습에 필요한 이름 또는 연습 단어만 사용해 주세요. 처리방침 문의는 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>으로 보내 주세요.</p>
        </section>
      </article>
    </>
  )
}

export function TermsPage() {
  return (
    <>
      <Seo
        title="이용약관"
        description="오늘의 한글 학습지와 화면 연습 참고 점수의 이용 범위, 출력 및 사용자 책임을 안내합니다."
        path="/terms"
      />
      <article className="content-page policy-page">
        <PageHeader
          eyebrow="이용약관"
          title="편안하고 안전한 학습 활동을 위한 기본 안내"
          description="인쇄 학습지와 화면 따라쓰기 점수의 활용 범위를 확인해 주세요."
        />
        <p className="policy-date">시행일 및 최종 수정일: 2026년 7월 26일</p>
        <section><h2>1. 서비스의 목적</h2><p>오늘의 한글 학습지는 부모 또는 보호자가 가정에서 사용할 한글 따라쓰기 자료와 화면 연습을 제공하는 도구입니다. 학교 교육과정이나 특정 교재를 대체하지 않습니다.</p></section>
        <section><h2>2. 전문 진단 및 획순 판정이 아님</h2><p>화면 점수는 모양, 위치, 완성도와 선 안정성을 규칙으로 비교한 참고 값입니다. 정확한 획순 판정, 언어 발달·학습 장애·운동 발달에 관한 교육 또는 의료 진단을 제공하지 않습니다.</p></section>
        <section><h2>3. 생성된 자료의 사용</h2><p>사용자는 직접 입력한 내용으로 생성된 PDF와 화면 연습 결과를 가정 및 교육 활동에 활용할 수 있습니다. 타인의 개인정보나 권리를 침해하는 내용을 입력해서는 안 됩니다.</p></section>
        <section><h2>4. 출력 및 사용 책임</h2><p>인쇄 전 철자, 용지 크기와 배율을 확인할 책임은 사용자에게 있습니다. 브라우저, 프린터, 글꼴과 입력 기기 차이로 출력 또는 점수가 달라질 수 있습니다.</p></section>
        <section><h2>5. 서비스와 정책 변경</h2><p>기능 개선, 운영상 필요 또는 관련 정책 변경에 따라 사이트 내용과 기능을 수정할 수 있습니다. 중요한 변경은 이 페이지의 수정일과 내용에 반영합니다.</p></section>
      </article>
    </>
  )
}

export function ContactPage() {
  return (
    <>
      <Seo title="문의 안내" description="오늘의 한글 학습지 기능, 오류와 개인정보 처리 문의 방법을 안내합니다." path="/contact" />
      <article className="content-page contact-page">
        <PageHeader eyebrow="문의 안내" title="사이트 이용 중 궁금한 점을 알려주세요" description="오류 제보, 기능 의견과 개인정보 처리 문의를 이메일로 받고 있습니다." />
        <section className="contact-card">
          <span>문의 이메일</span>
          <address><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></address>
          <p>보내주신 문의는 사이트 기능과 운영 개선을 위해 확인합니다.</p>
        </section>
        <section>
          <h2>문의할 때 함께 알려주시면 좋아요</h2>
          <ul><li>사용한 기기와 브라우저 종류</li><li>문제가 발생한 페이지와 기능</li><li>어떤 순서로 이용했을 때 문제가 생겼는지</li></ul>
          <p>아이의 전체 이름, 연락처, 사진이나 필기 이미지처럼 문제 해결에 필요하지 않은 개인정보는 보내지 말아 주세요.</p>
        </section>
        <section className="callout-section"><h2>먼저 확인해 보세요</h2><p>PDF, 인쇄, 화면 필기와 기록 삭제에 관한 일반적인 해결 방법은 자주 묻는 질문에 정리되어 있습니다.</p><a href="/faq/">자주 묻는 질문 보기</a></section>
      </article>
    </>
  )
}
