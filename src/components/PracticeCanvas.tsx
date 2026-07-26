import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { PracticeDisplayMode, PracticeStroke } from '../practice/types'

export interface PracticeCanvasHandle {
  getStrokes: () => PracticeStroke[]
  setStrokes: (strokes: PracticeStroke[]) => void
  undo: () => void
  clear: () => void
}

interface PracticeCanvasProps {
  item: string
  displayMode: PracticeDisplayMode
  onStrokeChange?: (strokeCount: number) => void
}

function cloneStrokes(strokes: PracticeStroke[]): PracticeStroke[] {
  return strokes.map((stroke) => ({ points: stroke.points.map((point) => ({ ...point })) }))
}

function fitGuideFont(context: CanvasRenderingContext2D, text: string, width: number, height: number) {
  const maxWidth = width * 0.78
  const maxHeight = height * 0.7
  let size = Math.min(height * (text.length > 1 ? 0.34 : 0.58), width * 0.58)
  for (let index = 0; index < 18; index += 1) {
    context.font = `800 ${size}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`
    const metrics = context.measureText(text)
    const measuredHeight = (metrics.actualBoundingBoxAscent || size * 0.8) + (metrics.actualBoundingBoxDescent || size * 0.2)
    if (metrics.width <= maxWidth && measuredHeight <= maxHeight) break
    size *= 0.9
  }
  return size
}

const PracticeCanvas = forwardRef<PracticeCanvasHandle, PracticeCanvasProps>(
  ({ item, displayMode, onStrokeChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const strokesRef = useRef<PracticeStroke[]>([])
    const activePointerRef = useRef<number | null>(null)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)

    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.max(1, window.devicePixelRatio || 1)
      const nextWidth = Math.max(1, Math.round(rect.width * dpr))
      const nextHeight = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth
        canvas.height = nextHeight
      }
      const context = canvas.getContext('2d')
      if (!context) return
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, rect.width, rect.height)
      context.fillStyle = '#fffefb'
      context.fillRect(0, 0, rect.width, rect.height)

      context.strokeStyle = '#dce7e2'
      context.lineWidth = 1
      context.setLineDash([5, 6])
      context.beginPath()
      context.moveTo(rect.width / 2, rect.height * 0.08)
      context.lineTo(rect.width / 2, rect.height * 0.92)
      context.moveTo(rect.width * 0.08, rect.height / 2)
      context.lineTo(rect.width * 0.92, rect.height / 2)
      context.stroke()
      context.setLineDash([])

      if (displayMode !== 'independent') {
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        const fontSize = fitGuideFont(context, item, rect.width, rect.height)
        context.font = `800 ${fontSize}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`
        if (displayMode === 'faint') {
          context.fillStyle = 'rgba(94, 158, 135, .20)'
          context.fillText(item, rect.width / 2, rect.height / 2)
        } else {
          context.strokeStyle = 'rgba(94, 158, 135, .36)'
          context.lineWidth = Math.max(2, fontSize * 0.035)
          context.lineCap = 'round'
          context.lineJoin = 'round'
          context.setLineDash([2, Math.max(7, fontSize * 0.045)])
          context.strokeText(item, rect.width / 2, rect.height / 2)
          context.setLineDash([])
        }
      }

      context.strokeStyle = '#315f51'
      context.fillStyle = '#315f51'
      context.lineCap = 'round'
      context.lineJoin = 'round'
      strokesRef.current.forEach((stroke) => {
        if (stroke.points.length === 1) {
          const point = stroke.points[0]
          const radius = Math.max(3, rect.width * 0.011 * (0.8 + point.pressure * 0.5))
          context.beginPath()
          context.arc(point.x * rect.width, point.y * rect.height, radius, 0, Math.PI * 2)
          context.fill()
          return
        }
        for (let index = 1; index < stroke.points.length; index += 1) {
          const previous = stroke.points[index - 1]
          const point = stroke.points[index]
          const pressure = (previous.pressure + point.pressure) / 2
          context.lineWidth = Math.max(5, rect.width * 0.021 * (0.78 + pressure * 0.5))
          context.beginPath()
          context.moveTo(previous.x * rect.width, previous.y * rect.height)
          if (index < stroke.points.length - 1) {
            const next = stroke.points[index + 1]
            context.quadraticCurveTo(
              point.x * rect.width,
              point.y * rect.height,
              ((point.x + next.x) / 2) * rect.width,
              ((point.y + next.y) / 2) * rect.height,
            )
          } else {
            context.lineTo(point.x * rect.width, point.y * rect.height)
          }
          context.stroke()
        }
      })
    }

    const notify = () => onStrokeChange?.(strokesRef.current.length)

    useImperativeHandle(ref, () => ({
      getStrokes: () => cloneStrokes(strokesRef.current),
      setStrokes: (strokes: PracticeStroke[]) => {
        strokesRef.current = cloneStrokes(strokes)
        draw()
        notify()
      },
      undo: () => {
        strokesRef.current = strokesRef.current.slice(0, -1)
        draw()
        notify()
      },
      clear: () => {
        strokesRef.current = []
        draw()
        notify()
      },
    }))

    useEffect(() => {
      draw()
    }, [displayMode, item])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return undefined
      resizeObserverRef.current = new ResizeObserver(draw)
      resizeObserverRef.current.observe(canvas)
      window.addEventListener('orientationchange', draw)
      return () => {
        resizeObserverRef.current?.disconnect()
        window.removeEventListener('orientationchange', draw)
      }
    }, [])

    const toPoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      return {
        x: Math.min(1, Math.max(0, (event.clientX - rect.left) / Math.max(1, rect.width))),
        y: Math.min(1, Math.max(0, (event.clientY - rect.top) / Math.max(1, rect.height))),
        pressure: event.pressure > 0 ? event.pressure : 0.5,
        time: performance.now(),
      }
    }

    const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      if (activePointerRef.current !== null) return
      activePointerRef.current = event.pointerId
      event.currentTarget.setPointerCapture(event.pointerId)
      strokesRef.current.push({ points: [toPoint(event)] })
      draw()
      notify()
    }

    const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (activePointerRef.current !== event.pointerId) return
      event.preventDefault()
      const stroke = strokesRef.current[strokesRef.current.length - 1]
      const point = toPoint(event)
      const previous = stroke.points[stroke.points.length - 1]
      if (Math.hypot(point.x - previous.x, point.y - previous.y) < 0.0015) return
      stroke.points.push(point)
      draw()
    }

    const finishPointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (activePointerRef.current !== event.pointerId) return
      event.preventDefault()
      activePointerRef.current = null
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
      draw()
      notify()
    }

    return (
      <canvas
        ref={canvasRef}
        className="practice-canvas"
        aria-label={`${item} 글자를 손가락, 펜 또는 마우스로 따라 쓰는 연습 칸`}
        role="img"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onContextMenu={(event: ReactMouseEvent<HTMLCanvasElement>) => event.preventDefault()}
      />
    )
  },
)

PracticeCanvas.displayName = 'PracticeCanvas'
export default PracticeCanvas
