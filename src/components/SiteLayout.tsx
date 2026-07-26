import type { ReactNode } from 'react'
import { SITE_NAME } from '../config'

interface SiteLayoutProps {
  children: ReactNode
  currentPath: string
}

interface NavigationLink { href: string; label: string; matchPath?: string; showActive?: boolean }

const mainLinks: NavigationLink[] = [
  { href: '/', label: '학습지 만들기' },
  { href: '/practice/', label: '화면 연습' },
  { href: '/guide/', label: '사용 가이드' },
]

const moreLinks: NavigationLink[] = [
  { href: '/practice/?view=history', label: '연습 기록', showActive: false },
  { href: '/faq/', label: '자주 묻는 질문' },
  { href: '/about/', label: '사이트 소개' },
  { href: '/privacy/', label: '개인정보처리방침' },
]

const desktopLinks = [...mainLinks, ...moreLinks.slice(0, 3)]

const policyLinks = [
  { href: '/about/', label: '소개' },
  { href: '/privacy/', label: '개인정보 처리방침' },
  { href: '/terms/', label: '이용약관' },
  { href: '/contact/', label: '문의' },
]

function isActive(currentPath: string, href: string, matchPath?: string, showActive = true) {
  if (!showActive) return false
  const target = matchPath ?? href.replace(/\/$/, '')
  if (target === '/') return currentPath === '/'
  return currentPath.startsWith(target)
}

export default function SiteLayout({ children, currentPath }: SiteLayoutProps) {
  return (
    <div className="site-shell" data-current-path={currentPath}>
      <a className="skip-link" href="#main-content">본문으로 바로가기</a>
      <header className="site-header no-print">
        <div className="header-inner">
          <a className="brand" href="/" aria-label={`${SITE_NAME} 홈`}>
            <span className="brand-mark">한</span>
            <span>{SITE_NAME}</span>
          </a>
          <nav className="primary-nav desktop-primary-nav" aria-label="주요 메뉴">
            {desktopLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive(currentPath, link.href, link.matchPath, link.showActive) ? 'page' : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <nav className="primary-nav mobile-primary-nav" aria-label="모바일 주요 메뉴">
            {mainLinks.map((link) => (
              <a key={link.href} href={link.href} aria-current={isActive(currentPath, link.href) ? 'page' : undefined}>{link.label}</a>
            ))}
            <details className="mobile-more-menu">
              <summary>더보기</summary>
              <div>
                {moreLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
              </div>
            </details>
          </nav>
        </div>
      </header>

      <main id="main-content">{children}</main>

      <footer className="site-footer no-print">
        <div className="footer-brand">
          <strong>{SITE_NAME}</strong>
          <p>부모가 아이와 함께 쓰는 무료 한글 학습 도구</p>
          <small>입력 내용과 필기 이미지는 서버로 전송하지 않으며, 연습 기록은 현재 브라우저에만 저장됩니다.</small>
        </div>
        <nav className="footer-links" aria-label="정책 및 안내 메뉴">
          {policyLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
        </nav>
      </footer>
    </div>
  )
}
