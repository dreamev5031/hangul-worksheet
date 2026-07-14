import type { ReactNode } from 'react'
import { SITE_NAME } from '../config'

interface SiteLayoutProps {
  children: ReactNode
  currentPath: string
}

const primaryLinks = [
  { href: '/', label: '학습지 만들기' },
  { href: '/guide/', label: '사용 가이드' },
  { href: '/faq/', label: '자주 묻는 질문' },
  { href: '/about/', label: '사이트 소개' },
]

const policyLinks = [
  { href: '/about/', label: '소개' },
  { href: '/privacy/', label: '개인정보 처리방침' },
  { href: '/terms/', label: '이용약관' },
  { href: '/contact/', label: '문의' },
]

export default function SiteLayout({ children, currentPath }: SiteLayoutProps) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">본문으로 바로가기</a>
      <header className="site-header no-print">
        <div className="header-inner">
          <a className="brand" href="/" aria-label={`${SITE_NAME} 홈`}>
            <span className="brand-mark">한</span>
            <span>{SITE_NAME}</span>
          </a>
          <nav className="primary-nav" aria-label="주요 메뉴">
            {primaryLinks.map((link) => {
              const active = link.href === '/'
                ? currentPath === '/'
                : currentPath.startsWith(link.href.replace(/\/$/, ''))
              return (
                <a key={link.href} href={link.href} aria-current={active ? 'page' : undefined}>
                  {link.label}
                </a>
              )
            })}
          </nav>
        </div>
      </header>

      <main id="main-content">{children}</main>

      <footer className="site-footer no-print">
        <div className="footer-brand">
          <strong>{SITE_NAME}</strong>
          <p>부모가 아이와 함께 쓰는 무료 한글 학습 도구</p>
          <small>입력한 이름과 단어는 서버로 전송하거나 저장하지 않습니다.</small>
        </div>
        <nav className="footer-links" aria-label="정책 및 안내 메뉴">
          {policyLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
        </nav>
      </footer>
    </div>
  )
}
