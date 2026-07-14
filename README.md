# 오늘의 한글 학습지

부모가 아이 이름이나 좋아하는 단어를 입력해 A4 한글 따라쓰기 학습지를 만들 수 있는 MVP입니다. 모든 기능은 브라우저 안에서 동작하며 서버, 데이터베이스, 로그인, AI API를 사용하지 않습니다.

## 실행 방법

Node.js 20 이상을 권장합니다.

```bash
npm install
npm run dev
```

화면에 표시된 로컬 주소를 브라우저에서 열면 됩니다.

프로덕션 빌드는 다음 명령으로 확인할 수 있습니다.

```bash
npm run build
```

완성된 정적 파일은 `dist` 폴더에 생성됩니다.

## Cloudflare Pages 배포

1. 이 프로젝트를 GitHub 저장소에 올립니다.
2. Cloudflare 대시보드에서 **Workers & Pages → Create → Pages → Connect to Git**을 선택합니다.
3. 저장소를 고른 뒤 아래 값을 입력합니다.
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. **Save and Deploy**를 누릅니다.

서버 기능이나 환경 변수는 필요하지 않습니다. `main` 브랜치에 변경 사항을 올리면 Cloudflare Pages가 자동으로 다시 배포합니다.

## 주요 기능

- 줄바꿈 또는 쉼표로 여러 한글 단어 입력
- 연령, 템플릿, 글자 크기, 반복 줄 수 선택
- 빈칸 연습과 칭찬 문구 선택
- 고정 A4 비율 실시간 미리보기
- `html2canvas`와 `jsPDF`를 사용한 PDF 저장
- `window.print()`와 인쇄 전용 CSS를 사용한 학습지 인쇄

학습지 글꼴은 `src/styles.css`의 `--font-worksheet` CSS 변수에서 쉽게 교체할 수 있습니다.

## 정보 페이지와 SEO 설정

사이트에는 `/about/`, `/privacy/`, `/terms/`, `/contact/`, `/guide/`, `/faq/`와 `404.html`이 포함됩니다. 각 페이지는 고유한 title, description, Open Graph 태그와 canonical URL을 갖는 정적 HTML로 빌드됩니다.

실제 도메인이 정해지면 Cloudflare Pages 환경 변수에 아래 값을 추가하세요.

```text
VITE_SITE_URL=https://your-domain.com
```

`public/robots.txt`와 `public/sitemap.xml`의 `https://example.com`도 실제 도메인으로 바꿔야 합니다. 문의 주소는 `src/config.ts`의 `CONTACT_EMAIL` 상수에서 변경할 수 있습니다.

## AdSense 신청 전 확인할 것

- [ ] 실제 도메인과 canonical URL이 일치하는지 확인
- [ ] `robots.txt`와 `sitemap.xml`의 예시 도메인을 실제 도메인으로 교체
- [ ] About, Privacy, Terms, Contact, Guide, FAQ 페이지의 내용과 내부 링크 확인
- [ ] 임시 문의 주소 `hello@example.com`을 실제 운영 이메일로 교체
- [ ] 개인정보 처리방침이 실제 서비스의 광고·분석 도구 사용 여부와 일치하는지 확인
- [ ] 홈과 가이드에 방문자에게 유용한 설명 콘텐츠가 충분한지 검토
- [ ] 광고가 입력폼, PDF 다운로드, 인쇄 버튼, A4 미리보기와 충분히 떨어져 있는지 확인
- [ ] 광고 클릭을 유도하거나 광고를 콘텐츠처럼 보이게 하는 문구가 없는지 확인
- [ ] 실제 AdSense 코드는 승인 및 설정 준비가 끝난 뒤 placeholder 위치에만 추가
- [ ] 광고나 분석 도구가 쿠키를 사용한다면 필요한 고지·동의 절차 준비
- [ ] AdSense 게시자 ID가 발급된 뒤 공식 안내에 따라 `ads.txt` 추가 여부 확인
- [ ] 모바일 화면에서 메뉴, 입력폼, 학습지 미리보기와 정보 페이지 확인
- [ ] A4 PDF 저장과 인쇄 결과를 Chrome, Safari 또는 Edge에서 확인
- [ ] Lighthouse로 접근성, SEO, 성능 기본 항목 점검
- [ ] 배포 직전 `npm run build`가 성공하는지 확인

현재 프로젝트에는 실제 광고 코드, 분석 코드, 외부 추적 스크립트, 로그인, 쿠키 기반 사용자 추적 기능이 없습니다.
