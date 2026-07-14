import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_SITE_URL = 'https://hangul-worksheet.pages.dev'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const siteUrl = env.VITE_SITE_URL || DEFAULT_SITE_URL

  return {
    // Cloudflare Pages serves this project from the domain root.
    base: '/',
    plugins: [
      react(),
      {
        name: 'canonical-url',
        transformIndexHtml(html: string) {
          return html.replaceAll('https://example.com', siteUrl)
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
