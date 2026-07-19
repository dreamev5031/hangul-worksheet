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
        description="오늘의 한글 학습지가 부모의 맞춤 한글 쓰기 활동을 어떻게 돕는지, 입력 정보를 어떻게 보호하는지 안내합니다."
        path="/about"
      />
      <article className="content-page">
        <PageHeader
          eyebrow="사이트 소개"
          title="아이에게 익숙한 단어로 시작하는 한글 쓰기"
          description="오늘의 한글 학습지는 부모가 아이의 이름과 관심사를 활용해 맞춤형 따라쓰기 학습지를 손쉽게 만드는 무료 도구입니다."
        />

        <section>
          <h2>부모가 직접 만드는 맞춤 학습지</h2>
          <p>아이마다 좋아하는 단어와 한글을 익히는 속도는 다릅니다. 공룡을 좋아하는 아이에게는 공룡 이름을, 가족에게 관심이 많은 아이에게는 엄마·아빠·형제 이름을 활용하면 낯선 교재보다 편안하게 쓰기 연습을 시작할 수 있습니다.</p>
          <p>이 사이트는 복잡한 편집 프로그램 없이 단어를 입력하고 몇 가지 옵션만 고르면 A4 학습지를 만들 수 있도록 설계했습니다. 완성된 학습지는 PDF로 저장하거나 바로 인쇄할 수 있습니다.</p>
        </section>

        <section>
          <h2>우리가 중요하게 생각하는 것</h2>
          <div className="value-list">
            <div><strong>간단함</strong><p>회원가입이나 설치 없이 필요한 순간 바로 사용할 수 있습니다.</p></div>
            <div><strong>아이의 속도</strong><p>많이 쓰게 하기보다 짧고 즐겁게 반복하는 활동을 권합니다.</p></div>
            <div><strong>부모 중심</strong><p>실제 사용자는 부모라는 점을 고려해 안내와 출력 과정을 명확하게 구성합니다.</p></div>
            <div><strong>정보 보호</strong><p>입력한 아이 이름과 단어를 서버로 보내거나 데이터베이스에 저장하지 않습니다.</p></div>
          </div>
        </section>

        <section className="callout-section">
          <h2>입력한 내용은 어디에 저장되나요?</h2>
          <p>입력한 이름과 단어는 사용자의 브라우저 안에서 미리보기를 표시하고 PDF를 만드는 데만 사용됩니다. 운영자 서버나 데이터베이스로 전송되지 않으며 페이지를 닫거나 새로고침하면 입력 내용이 유지되지 않습니다.</p>
          <a href="/privacy/">개인정보 처리방침 확인하기</a>
        </section>

        <section>
          <h2>학습지를 더 편안하게 활용하려면</h2>
          <p>아이의 나이보다 현재 쓰기 경험과 집중 시간을 기준으로 분량을 조절해 주세요. 글씨 모양을 지적하기보다 연필을 잡고 끝까지 써 본 과정을 칭찬하면 다음 활동에 대한 부담을 줄일 수 있습니다.</p>
          <a className="text-link" href="/guide/">한글쓰기 학습지 사용 가이드 보기</a>
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
        description="오늘의 한글 학습지의 개인정보 처리 방식, 브라우저 내 입력 정보 처리와 광고 서비스 이용 가능성을 안내합니다."
        path="/privacy"
      />
      <article className="content-page policy-page">
        <PageHeader
          eyebrow="개인정보 처리방침"
          title="입력 정보는 브라우저 안에서만 처리됩니다"
          description="오늘의 한글 학습지는 학습지에 입력한 이름과 단어를 운영자 서버에 저장하지 않습니다."
        />
        <p className="policy-date">시행일: 2026년 7월 19일</p>

        <section>
          <h2>1. 수집하는 개인정보</h2>
          <p>오늘의 한글 학습지는 회원가입, 로그인, 문의 양식, 결제 기능을 제공하지 않으며 이름, 연락처, 계정 정보 같은 개인정보를 직접 수집하거나 사용자별 기록으로 저장하지 않습니다.</p>
        </section>

        <section>
          <h2>2. 입력한 이름과 단어의 처리</h2>
          <p>학습지 생성기에 입력한 아이 이름과 단어는 사용자의 브라우저에서 실시간 미리보기를 만들고 PDF를 생성하는 데만 사용됩니다. 해당 내용은 운영자 서버로 전송되지 않으며 브라우저 저장소에도 별도로 보관하지 않습니다.</p>
        </section>

        <section>
          <h2>3. 광고 서비스와 쿠키</h2>
          <p>사이트 운영을 위해 Google AdSense와 같은 제3자 광고 서비스를 사용할 수 있습니다. 광고 서비스가 활성화된 경우 Google과 광고 파트너는 광고 제공, 빈도 제한, 부정 사용 방지, 광고 효과 측정 등을 위해 쿠키 또는 유사 기술을 사용할 수 있습니다.</p>
          <p>맞춤 광고 제공 여부와 광고 개인정보 설정은 Google 광고 설정 등 해당 서비스가 제공하는 관리 화면에서 변경할 수 있습니다. 관련 법령상 동의가 필요한 지역의 방문자에게는 필요한 고지 또는 동의 절차를 적용합니다.</p>
        </section>

        <section>
          <h2>4. 접속 정보</h2>
          <p>Cloudflare Pages와 같은 호스팅 사업자는 서비스 보안과 안정적인 제공을 위해 IP 주소, 브라우저 종류, 접속 시각과 같은 기술 정보를 처리할 수 있습니다. 이러한 정보의 처리는 각 사업자의 개인정보 처리방침과 보안 정책을 따릅니다.</p>
        </section>

        <section>
          <h2>5. 어린이 관련 정보</h2>
          <p>이 사이트의 실제 사용자는 부모 또는 보호자입니다. 아이의 민감한 개인정보나 연락처를 입력하지 말고 학습지에 꼭 필요한 이름 또는 연습 단어만 입력해 주세요. 입력 정보는 저장되지 않지만 출력된 학습지의 보관과 폐기는 사용자 책임입니다.</p>
        </section>

        <section>
          <h2>6. 외부 링크와 문의</h2>
          <p>사이트에 연결된 외부 서비스에는 해당 서비스의 개인정보 처리방침이 적용될 수 있습니다. 본 처리방침에 관한 문의는 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>으로 보내 주세요.</p>
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
        description="오늘의 한글 학습지 이용 조건과 교육용 참고자료의 범위, 생성된 PDF의 출력 및 사용 책임을 안내합니다."
        path="/terms"
      />
      <article className="content-page policy-page">
        <PageHeader
          eyebrow="이용약관"
          title="편안하고 안전한 학습 활동을 위한 기본 안내"
          description="사이트를 이용하기 전에 학습지의 활용 범위와 사용자 책임을 확인해 주세요."
        />
        <p className="policy-date">시행일: 2026년 7월 19일</p>

        <section>
          <h2>1. 서비스의 목적</h2>
          <p>오늘의 한글 학습지는 부모 또는 보호자가 가정에서 사용할 한글 따라쓰기 자료를 만드는 도구입니다. 제공되는 학습지는 가정용·교육용 참고자료이며 학교 교육과정이나 특정 교재를 대체하도록 만들어진 것은 아닙니다.</p>
        </section>
        <section>
          <h2>2. 전문 진단 및 치료 목적이 아님</h2>
          <p>이 사이트의 안내와 학습지는 언어 발달, 학습 장애, 운동 발달 등에 관한 전문 교육 진단이나 의료적 치료를 제공하지 않습니다. 아이의 발달 또는 학습 상태가 걱정되는 경우 교사, 전문 상담가 또는 의료진과 상의해 주세요.</p>
        </section>
        <section>
          <h2>3. 생성된 자료의 사용</h2>
          <p>사용자는 직접 입력한 단어를 바탕으로 생성된 PDF를 가정 및 교육 활동에 활용할 수 있습니다. 타인의 개인정보나 권리를 침해하는 내용 또는 부적절한 단어를 입력해서는 안 됩니다.</p>
        </section>
        <section>
          <h2>4. 출력 및 사용 책임</h2>
          <p>인쇄 전 단어의 철자, 이름, 용지 크기와 배율을 확인할 책임은 사용자에게 있습니다. 브라우저, 프린터, 운영체제 차이로 출력 결과가 달라질 수 있으며 생성된 PDF의 보관·공유·폐기에 관한 책임도 사용자에게 있습니다.</p>
        </section>
        <section>
          <h2>5. 서비스와 정책 변경</h2>
          <p>기능 개선, 운영상 필요 또는 관련 정책 변경에 따라 사이트 내용과 기능을 수정할 수 있습니다. 중요한 변경이 있을 경우 이 페이지의 시행일과 내용을 갱신합니다.</p>
        </section>
      </article>
    </>
  )
}

export function ContactPage() {
  return (
    <>
      <Seo
        title="문의 안내"
        description="오늘의 한글 학습지 기능, 오류, 개인정보 처리와 관련된 문의 방법을 안내합니다."
        path="/contact"
      />
      <article className="content-page contact-page">
        <PageHeader
          eyebrow="문의 안내"
          title="사이트 이용 중 궁금한 점을 알려주세요"
          description="오류 제보, 기능 의견, 개인정보 처리와 관련된 문의를 이메일로 받고 있습니다."
        />

        <section className="contact-card">
          <span>문의 이메일</span>
          <address><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></address>
          <p>보내주신 문의는 사이트 기능과 운영 개선을 위해 확인합니다.</p>
        </section>

        <section>
          <h2>문의할 때 함께 알려주시면 좋아요</h2>
          <ul>
            <li>사용한 기기와 브라우저 종류</li>
            <li>문제가 발생한 페이지와 기능</li>
            <li>어떤 순서로 이용했을 때 문제가 생겼는지</li>
          </ul>
          <p>아이의 전체 이름, 연락처, 사진처럼 문제 해결에 필요하지 않은 개인정보는 보내지 말아 주세요.</p>
        </section>

        <section className="callout-section">
          <h2>먼저 확인해 보세요</h2>
          <p>PDF 저장, 인쇄 여백, 모바일 이용과 관련된 일반적인 해결 방법은 자주 묻는 질문에 정리되어 있습니다.</p>
          <a href="/faq/">자주 묻는 질문 보기</a>
        </section>
      </article>
    </>
  )
}
