# 오늘의 한글 학습지

부모가 아이 이름이나 좋아하는 단어를 입력해 A4 한글 학습지를 만들고, 같은 내용을 손가락·스타일러스·마우스로 화면에서 따라 쓸 수 있는 브라우저 기반 도구입니다. 서버, 데이터베이스, 로그인, LLM 또는 외부 이미지 분석 API를 사용하지 않습니다.

## 실행 방법

Node.js 20 이상을 권장합니다.

```bash
npm install
npm run dev
```

프로덕션 빌드는 `npm run build`로 확인하며 결과는 `dist`에 생성됩니다.

## Cloudflare Pages 배포

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

이 프로젝트는 React Router SPA가 아니라 각 경로에 실제 `index.html`을 생성하는 정적 멀티페이지 구조입니다. `/practice/`, `/about/`, `/privacy/`, `/terms/`, `/contact/`, `/guide/`, `/faq/`를 새로고침해도 Cloudflare Pages에서 404가 발생하지 않습니다.

## 주요 기능

- 줄바꿈 또는 쉼표로 글자·단어·이름·짧은 문장 입력
- 기존 A4 미리보기, PDF 다운로드와 인쇄 기능
- 글자 크기, 따라쓰기/빈칸 비율, 이름·날짜·빈칸·칭찬 설정
- `/practice/`에서 Pointer Events 기반 손가락·펜·마우스 필기
- 현재 획의 시작점·방향·반복 애니메이션과 완료 획 고정 표시
- `Intl.Segmenter` 기반 한글 음절·호환 자모 한 글자씩 분리
- 자모별 정규화 획 경로와 Unicode 음절 분해 기반 획순 안내
- pointerup 시 시작점·방향·경로 근접도 기반 한 획 자동 판정
- 다시 써본 글자를 기존 “따라쓰기 많이” 인쇄 학습지로 자동 연결
- 필기 이미지와 획 원본을 저장하지 않는 브라우저 전용 연습 기록

학습지와 화면 기준 글꼴은 `src/styles.css`의 `--font-worksheet`와 같은 시스템 한글 글꼴 계열을 사용합니다.

## 개인정보 처리

입력한 이름과 단어, 필기 이미지와 실제 획 좌표는 서버에 업로드하지 않습니다. 분석은 현재 브라우저에서 실행합니다. 완료 기록에는 날짜, 완성한 글자, 재시도 횟수와 연습 시간만 versioned localStorage에 저장하며 연습 기록 화면에서 삭제할 수 있습니다.

기본 canonical URL은 `https://hangul-worksheet.pages.dev`입니다. 사용자 정의 도메인을 연결하면 `VITE_SITE_URL`, `public/robots.txt`와 `public/sitemap.xml`을 함께 변경하세요.
