import { useEffect } from 'react'
import { SITE_NAME, SITE_URL } from '../config'

interface SeoProps {
  title: string
  description: string
  path: string
  noIndex?: boolean
}

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

export default function Seo({ title, description, path, noIndex = false }: SeoProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`
    const canonicalUrl = `${SITE_URL}${path === '/' ? '/' : `${path}/`}`
    document.title = fullTitle
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (noIndex) {
      setMeta('meta[name="robots"]', 'name', 'robots', 'noindex, follow')
      canonical?.remove()
    } else {
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.href = canonicalUrl
    }
  }, [description, noIndex, path, title])

  return null
}
