import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_SITE_URL = 'https://hangul-worksheet.pages.dev'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const siteUrl = env.VITE_SITE_URL || DEFAULT_SITE_URL
  const adsenseClient = env.VITE_ADSENSE_CLIENT?.trim()
  const adsenseScript = adsenseClient?.startsWith('ca-pub-')
    ? `\n    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}" crossorigin="anonymous"></script>`
    : ''

  return {
    // Cloudflare Pages serves this project from the domain root.
    base: '/',
    plugins: [
      react(),
      {
        name: 'site-head-settings',
        transformIndexHtml(html: string) {
          return html
            .replaceAll('https://example.com', siteUrl)
            .replace('</head>', `${adsenseScript}\n  </head>`)
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          home: 'index.html',
          about: 'about/index.html',
          privacy: 'privacy/index.html',
          terms: 'terms/index.html',
          contact: 'contact/index.html',
          guide: 'guide/index.html',
          faq: 'faq/index.html',
          notFound: '404.html',
        },
      },
    },
  }
})
