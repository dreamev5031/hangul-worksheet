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
          <p>현재 MVP에서는 어디에도 저장되지 않습니다. 이름과 단어는 사용자의 브라우저 안에서 미리보기를 표시하고 PDF를 만드는 데만 사용됩니다. 페이지를 닫거나 새로고침하면 입력 내용이 유지되지 않습니다.</p>
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
        description="오늘의 한글 학습지의 개인정보 처리 방식과 브라우저 내 단어·이름 처리, 향후 광고·분석 도구 도입 가능성을 안내합니다."
        path="/privacy"
      />
      <article className="content-page policy-page">
        <PageHeader
          eyebrow="개인정보 처리방침"
          title="입력 정보는 브라우저 안에서만 처리됩니다"
          description="현재 MVP는 개인정보를 수집하거나 서버에 저장하지 않습니다."
        />
        <p className="policy-date">시행일: 2026년 7월 14일</p>

        <section>
          <h2>1. 현재 수집하는 개인정보</h2>
          <p>현재 오늘의 한글 학습지는 회원가입, 로그인, 문의 양식, 결제 기능을 제공하지 않으며 이름, 연락처, 계정 정보 같은 개인정보를 수집하지 않습니다. 서버 또는 데이터베이스에 사용자별 기록을 저장하지 않습니다.</p>
        </section>

        <section>
          <h2>2. 입력한 이름과 단어의 처리</h2>
          <p>학습지 생성기에 입력한 아이 이름과 단어는 사용자의 브라우저에서 실시간 미리보기를 만들고 PDF를 생성하는 데만 사용됩니다. 해당 내용은 운영자 서버로 전송되지 않으며, 브라우저 저장소에도 별도로 보관하지 않습니다.</p>
        </section>

        <section>
          <h2>3. 쿠키 및 추적 기술</h2>
          <p>현재 사이트에는 광고 코드, 방문자 분석 코드, 외부 추적 스크립트가 없으며 추적 목적의 쿠키를 설정하지 않습니다. 로그인 상태나 사용자 프로필을 유지하기 위한 쿠키도 사용하지 않습니다.</p>
        </section>

        <section>
          <h2>4. 향후 광고 또는 분석 도구</h2>
          <p>서비스 개선이나 운영을 위해 나중에 Google AdSense 같은 광고 서비스 또는 방문 통계 분석 도구를 추가할 수 있습니다. 이 경우 제3자 서비스가 쿠키나 유사 기술을 사용할 수 있으며, 적용 전에 본 처리방침을 갱신하고 관련 법령에 따라 필요한 고지와 동의 절차를 마련하겠습니다.</p>
          <p>현재 버전에는 실제 광고 또는 분석 추적 코드가 포함되어 있지 않습니다.</p>
        </section>

        <section>
          <h2>5. 어린이 관련 정보</h2>
          <p>이 사이트의 실제 사용자는 부모 또는 보호자입니다. 아이의 민감한 개인정보나 연락처를 입력하지 말고, 학습지에 꼭 필요한 이름 또는 연습 단어만 입력해 주세요. 입력 정보는 저장되지 않지만, 출력된 학습지의 보관과 폐기는 사용자 책임입니다.</p>
        </section>

        <section>
          <h2>6. 외부 링크와 문의</h2>
          <p>사이트에 외부 서비스 링크가 추가되는 경우 해당 서비스의 개인정보 처리방침이 적용될 수 있습니다. 본 처리방침에 관한 문의는 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>으로 보내 주세요.</p>
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
        <p className="policy-date">시행일: 2026년 7월 14일</p>

        <section>
          <h2>1. 서비스의 목적</h2>
          <p>오늘의 한글 학습지는 부모 또는 보호자가 가정에서 사용할 한글 따라쓰기 자료를 만드는 도구입니다. 제공되는 학습지는 가정용·교육용 참고자료이며, 학교 교육과정이나 특정 교재를 대체하도록 만들어진 것은 아닙니다.</p>
        </section>
        <section>
          <h2>2. 전문 진단 및 치료 목적이 아님</h2>
          <p>이 사이트의 안내와 학습지는 언어 발달, 학습 장애, 운동 발달 등에 관한 전문 교육 진단이나 의료적 치료를 제공하지 않습니다. 아이의 발달 또는 학습 상태가 걱정되는 경우 교사, 전문 상담가 또는 의료진과 상의해 주세요.</p>
        </section>
        <section>
          <h2>3. 생성된 자료의 사용</h2>
          <p>사용자는 직접 입력한 단어를 바탕으로 생성된 PDF를 가정 및 교육 활동에 활용할 수 있습니다. 타인의 개인정보, 권리를 침해하는 내용이나 부적절한 단어를 입력해서는 안 됩니다.</p>
        </section>
        <section>
          <h2>4. 출력 및 사용 책임</h2>
          <p>인쇄 전 단어의 철자, 이름, 용지 크기와 배율을 확인할 책임은 사용자에게 있습니다. 브라우저, 프린터, 운영체제 차이로 출력 결과가 달라질 수 있으며, 생성된 PDF의 보관·공유·폐기에 관한 책임도 사용자에게 있습니다.</p>
        </section>
        <section>
          <h2>5. 서비스 변경</h2>
          <p>기능 개선이나 정책 변경을 위해 사이트 내용과 기능을 수정할 수 있습니다. 중요한 약관 변경이 있을 경우 이 페이지의 시행일과 내용을 갱신합니다.</p>
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
          <p>현재 주소는 MVP 테스트용 임시 이메일입니다. 실제 서비스 공개 전 운영 이메일로 교체할 예정입니다.</p>
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
