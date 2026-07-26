import { useEffect } from 'react'

export default function PracticeViewportDiagnostics() {
  useEffect(() => {
    let frame = 0
    const measure = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const shell = document.querySelector<HTMLElement>('.practice-session-shell')
        if (!shell) return
        const root = document.documentElement
        const scrollOk = root.scrollHeight <= root.clientHeight + 2 && root.scrollWidth <= root.clientWidth + 2
        shell.dataset.scrollOk = String(scrollOk)
        shell.dataset.scrollHeight = String(root.scrollHeight)
        shell.dataset.clientHeight = String(root.clientHeight)
        shell.dataset.scrollWidth = String(root.scrollWidth)
        shell.dataset.clientWidth = String(root.clientWidth)
      })
    }

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(document.documentElement)
    resizeObserver.observe(document.body)
    const mutationObserver = new MutationObserver(measure)
    mutationObserver.observe(document.documentElement, { childList: true, subtree: true })
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    window.visualViewport?.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('scroll', measure)
    const interval = window.setInterval(measure, 180)
    measure()

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearInterval(interval)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
      window.visualViewport?.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('scroll', measure)
    }
  }, [])

  return null
}
