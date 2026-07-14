import type { ReactNode } from 'react'
import SiteLayout from './components/SiteLayout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/About'
import ContactPage from './pages/Contact'
import FaqPage from './pages/Faq'
import GuidePage from './pages/Guide'
import NotFoundPage from './pages/NotFound'
import PrivacyPage from './pages/Privacy'
import TermsPage from './pages/Terms'

function normalizePath(pathname: string) {
  if (pathname === '/' || pathname === '/index.html') return '/'
  return pathname.replace(/\/$/, '')
}

export default function App() {
  const path = normalizePath(window.location.pathname)

  const pages: Record<string, ReactNode> = {
    '/': <HomePage />,
    '/about': <AboutPage />,
    '/privacy': <PrivacyPage />,
    '/terms': <TermsPage />,
    '/contact': <ContactPage />,
    '/guide': <GuidePage />,
    '/faq': <FaqPage />,
    '/404.html': <NotFoundPage />,
  }

  return (
    <SiteLayout currentPath={path}>
      {pages[path] ?? <NotFoundPage />}
    </SiteLayout>
  )
}
