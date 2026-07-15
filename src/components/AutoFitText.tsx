import { useLayoutEffect, useRef } from 'react'

interface AutoFitTextProps {
  text: string
  className?: string
  fitKey?: string
}

const MIN_FONT_SIZE = 1

function toPixels(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// 실제 부모 영역을 측정해 한 줄 텍스트가 모두 보이는 가장 큰 크기를 찾습니다.
export default function AutoFitText({ text, className = '', fitKey = '' }: AutoFitTextProps) {
  const textRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const element = textRef.current
    const container = element?.parentElement
    if (!element || !container) return undefined


    let animationFrame = 0

    const fitText = () => {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(() => {
        // 인라인 크기를 지운 뒤 CSS에 설정된 현재 옵션의 최대 크기를 읽습니다.
        element.style.fontSize = ''

        const elementStyle = window.getComputedStyle(element)
        const containerStyle = window.getComputedStyle(container)
        const maximumFontSize = toPixels(elementStyle.fontSize)
        const horizontalPadding = toPixels(containerStyle.paddingLeft) + toPixels(containerStyle.paddingRight)
        const verticalPadding = toPixels(containerStyle.paddingTop) + toPixels(containerStyle.paddingBottom)
        const availableWidth = Math.max(0, container.clientWidth - horizontalPadding)
        const availableHeight = Math.max(0, container.clientHeight - verticalPadding)
        // 캡처·인쇄 시 미세한 글꼴 차이에도 테두리와 겹치지 않도록 가로 안전 여백을 둡니다.
        const safeAvailableWidth = availableWidth * 0.92

        if (maximumFontSize <= 0 || safeAvailableWidth <= 0 || availableHeight <= 0) return

        const fits = (fontSize: number) => {
          element.style.fontSize = fontSize + 'px'

          // 브라우저가 실제 시스템 글꼴로 그린 크기를 읽어 PDF·인쇄 결과와 같은 기준으로 맞춥니다.
          const renderedRect = element.getBoundingClientRect()
          return renderedRect.width <= safeAvailableWidth
            && renderedRect.height <= availableHeight
            && element.scrollWidth <= safeAvailableWidth
            && element.scrollHeight <= availableHeight
        }

        let lower = MIN_FONT_SIZE
        let upper = maximumFontSize

        // 영역 안에 들어오는 가장 큰 글자 크기를 이진 탐색합니다.
        for (let iteration = 0; iteration < 14; iteration += 1) {
          const middle = (lower + upper) / 2
          if (fits(middle)) lower = middle
          else upper = middle
        }

        element.style.fontSize = Math.min(lower, maximumFontSize).toFixed(2) + 'px'
      })
    }

    const resizeObserver = new ResizeObserver(fitText)
    resizeObserver.observe(container)
    fitText()
    void document.fonts.ready.then(fitText)

    return () => {
      resizeObserver.disconnect()
      window.cancelAnimationFrame(animationFrame)
    }
  }, [className, fitKey, text])

  return (
    <span ref={textRef} className={('auto-fit-text ' + className).trim()}>
      {text}
    </span>
  )
}