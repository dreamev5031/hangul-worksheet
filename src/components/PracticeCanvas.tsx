import { useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import {
  CANONICAL_STROKE_RENDERING_MARKER,
  getCanonicalStrokeLayers,
  getCanonicalStrokeVisualMetrics,
} from '../practice/canonicalStrokeRendering'
import { pointAtProgress } from '../practice/strokePath'
import type { GeneratedCharacter, PracticePoint } from '../practice/types'

interface PracticeCanvasProps {
  character: GeneratedCharacter
  currentStrokeIndex: number
  completedStrokeCount: number
  retryCount: number
  guideReplayKey: number
  phase: 'writing' | 'stroke-success' | 'retry' | 'character-complete'
  failedStroke: PracticePoint[] | null
  onInteractionStart: () => void
  onStrokeEnd: (points: PracticePoint[]) => void
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function drawPolyline(
  context: CanvasRenderingContext2D,
  points: PracticePoint[],
  width: number,
  height: number,
  style: { color: string; lineWidth: number; dash?: number[]; alpha?: number },
) {
  if (points.length < 2) return
  context.save()
  context.globalAlpha = style.alpha ?? 1
  context.strokeStyle = style.color
  context.lineWidth = style.lineWidth
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.setLineDash(style.dash ?? [])
  context.beginPath()
  context.moveTo(points[0].x * width, points[0].y * height)
  for (let index = 1; index < points.length; index += 1) {
    context.lineTo(points[index].x * width, points[index].y * height)
  }
  context.stroke()
  context.restore()
}

function drawArrow(
  context: CanvasRenderingContext2D,
  from: PracticePoint,
  to: PracticePoint,
  width: number,
  height: number,
  strong: boolean,
) {
  const x = to.x * width
  const y = to.y * height
  const angle = Math.atan2((to.y - from.y) * height, (to.x - from.x) * width)
  const side = Math.min(width, height)
  const size = clamp(side * 0.018 + (strong ? 1 : 0), 9, 14)
  context.save()
  context.translate(x, y)
  context.rotate(angle)
  context.fillStyle = strong ? '#2f7d65' : '#65a58e'
  context.beginPath()
  context.moveTo(size, 0)
  context.lineTo(-size * 0.6, -size * 0.55)
  context.lineTo(-size * 0.6, size * 0.55)
  context.closePath()
  context.fill()
  context.restore()
}

function normalizePoint(event: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): PracticePoint {
  const rect = canvas.getBoundingClientRect()
  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / Math.max(1, rect.width))),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / Math.max(1, rect.height))),
    pressure: event.pressure || 0.5,
    time: performance.now(),
  }
}

export default function PracticeCanvas({
  character,
  currentStrokeIndex,
  completedStrokeCount,
  retryCount,
  guideReplayKey,
  phase,
  failedStroke,
  onInteractionStart,
  onStrokeEnd,
}: PracticeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activePointerRef = useRef<number | null>(null)
  const activeStrokeRef = useRef<PracticePoint[]>([])
  const animationStartRef = useRef(performance.now())
  const frameRef = useRef<number | null>(null)
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    animationStartRef.current = performance.now()
  }, [guideReplayKey, currentStrokeIndex, retryCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = (time = performance.now()) => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2.25, Math.max(1, window.devicePixelRatio || 1))
      const pixelWidth = Math.max(1, Math.round(rect.width * dpr))
      const pixelHeight = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }
      const context = canvas.getContext('2d')
      if (!context) return
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, rect.width, rect.height)
      context.fillStyle = '#fffefb'
      context.fillRect(0, 0, rect.width, rect.height)

      context.strokeStyle = '#e6ece8'
      context.lineWidth = 1
      context.setLineDash([5, 7])
      context.beginPath()
      context.moveTo(rect.width / 2, rect.height * 0.06)
      context.lineTo(rect.width / 2, rect.height * 0.94)
      context.moveTo(rect.width * 0.06, rect.height / 2)
      context.lineTo(rect.width * 0.94, rect.height / 2)
      context.stroke()
      context.setLineDash([])

      const side = Math.min(rect.width, rect.height)
      const layers = getCanonicalStrokeLayers(character, currentStrokeIndex, completedStrokeCount)

      // 흐린 완성 글자, 완료 획, 현재 획, 안내와 판정은 최종 fit된 동일 StrokePath 객체를 사용합니다.
      layers.background.forEach((stroke) => {
        const visual = getCanonicalStrokeVisualMetrics(side, stroke)
        drawPolyline(context, stroke.guidePoints, rect.width, rect.height, {
          color: '#b9d1c7',
          lineWidth: visual.backgroundWidth,
          alpha: 0.28,
        })
      })

      layers.completed.forEach((stroke) => {
        const visual = getCanonicalStrokeVisualMetrics(side, stroke)
        drawPolyline(context, stroke.guidePoints, rect.width, rect.height, {
          color: '#2f7d65',
          lineWidth: visual.completedWidth,
        })
      })

      const currentStroke = layers.current
      if (currentStroke) {
        const helpLevel = retryCount >= 3 ? 2 : retryCount >= 2 ? 1 : 0
        const visual = getCanonicalStrokeVisualMetrics(side, currentStroke)
        drawPolyline(context, currentStroke.guidePoints, rect.width, rect.height, {
          color: helpLevel >= 2 ? '#65b597' : '#79bea4',
          lineWidth: clamp(visual.currentWidth * (helpLevel >= 2 ? 1.08 : 1), 4.4, 15),
          dash: reducedMotionRef.current ? undefined : visual.dash,
          alpha: 0.96,
        })

        const startRadius = clamp(visual.startRadius + helpLevel * 1.25, 8, 14)
        context.fillStyle = '#fffefb'
        context.strokeStyle = '#2f7d65'
        context.lineWidth = clamp(side * 0.004, 2, 3.5)
        context.beginPath()
        context.arc(currentStroke.start.x * rect.width, currentStroke.start.y * rect.height, startRadius, 0, Math.PI * 2)
        context.fill()
        context.stroke()
        context.fillStyle = '#2f7d65'
        context.font = `800 ${clamp(startRadius, 11, 14)}px sans-serif`
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(String(currentStrokeIndex + 1), currentStroke.start.x * rect.width, currentStroke.start.y * rect.height + 0.5)

        const arrowFrom = pointAtProgress(currentStroke.guidePoints, 0.18)
        const arrowTo = pointAtProgress(currentStroke.guidePoints, 0.28)
        drawArrow(context, arrowFrom, arrowTo, rect.width, rect.height, helpLevel >= 1)

        if (!reducedMotionRef.current && phase === 'writing') {
          const elapsed = (time - animationStartRef.current) % 2200
          const activeDuration = 1450
          const progress = Math.min(1, elapsed / activeDuration)
          if (elapsed <= activeDuration) {
            const guidePoint = pointAtProgress(currentStroke.guidePoints, progress)
            const glowRadius = clamp(visual.glowRadius + (helpLevel >= 1 ? 1 : 0), 6, 10.5)
            const gradient = context.createRadialGradient(
              guidePoint.x * rect.width,
              guidePoint.y * rect.height,
              0,
              guidePoint.x * rect.width,
              guidePoint.y * rect.height,
              glowRadius * 2,
            )
            gradient.addColorStop(0, 'rgba(255,255,255,1)')
            gradient.addColorStop(0.35, 'rgba(255,210,85,.95)')
            gradient.addColorStop(1, 'rgba(255,210,85,0)')
            context.fillStyle = gradient
            context.beginPath()
            context.arc(guidePoint.x * rect.width, guidePoint.y * rect.height, glowRadius * 2, 0, Math.PI * 2)
            context.fill()
          }
        }
      }

      if (activeStrokeRef.current.length > 1) {
        const visual = currentStroke ? getCanonicalStrokeVisualMetrics(side, currentStroke) : null
        drawPolyline(context, activeStrokeRef.current, rect.width, rect.height, {
          color: '#234f42',
          lineWidth: visual?.userWidth ?? clamp(side * 0.016, 6, 14),
        })
      }

      if (failedStroke && failedStroke.length > 1) {
        const visual = currentStroke ? getCanonicalStrokeVisualMetrics(side, currentStroke) : null
        drawPolyline(context, failedStroke, rect.width, rect.height, {
          color: '#e6a15d',
          lineWidth: visual?.userWidth ?? clamp(side * 0.016, 6, 14),
          alpha: 0.7,
        })
      }

      if (phase === 'stroke-success' || phase === 'character-complete') {
        const completedIndex = Math.min(character.strokes.length - 1, Math.max(0, completedStrokeCount - 1))
        const anchor = character.strokes[completedIndex]?.end ?? { x: 0.5, y: 0.5 }
        const innerRadius = clamp(side * 0.012, 8, 11)
        const outerRadius = clamp(side * 0.023, 14, 19)
        context.save()
        context.translate(anchor.x * rect.width, anchor.y * rect.height)
        context.strokeStyle = '#f0b83f'
        context.lineWidth = 2
        for (let ray = 0; ray < 8; ray += 1) {
          const angle = (Math.PI * 2 * ray) / 8
          context.beginPath()
          context.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius)
          context.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius)
          context.stroke()
        }
        context.restore()
      }
    }

    const animate = (time: number) => {
      draw(time)
      frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    const observer = new ResizeObserver(() => draw())
    observer.observe(canvas)
    const handleOrientation = () => window.setTimeout(() => draw(), 80)
    window.addEventListener('orientationchange', handleOrientation)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      observer.disconnect()
      window.removeEventListener('orientationchange', handleOrientation)
    }
  }, [character, currentStrokeIndex, completedStrokeCount, retryCount, guideReplayKey, phase, failedStroke])

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (phase !== 'writing') return
    const canvas = event.currentTarget
    event.preventDefault()
    onInteractionStart()
    activePointerRef.current = event.pointerId
    activeStrokeRef.current = [normalizePoint(event, canvas)]
    canvas.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (activePointerRef.current !== event.pointerId || phase !== 'writing') return
    event.preventDefault()
    const next = normalizePoint(event, event.currentTarget)
    const previous = activeStrokeRef.current[activeStrokeRef.current.length - 1]
    if (!previous || Math.hypot(next.x - previous.x, next.y - previous.y) >= 0.003) {
      activeStrokeRef.current.push(next)
    }
  }

  const finishPointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (activePointerRef.current !== event.pointerId) return
    event.preventDefault()
    const canvas = event.currentTarget
    const finalPoint = normalizePoint(event, canvas)
    const points = [...activeStrokeRef.current]
    const previous = points[points.length - 1]
    if (!previous || Math.hypot(finalPoint.x - previous.x, finalPoint.y - previous.y) >= 0.002) points.push(finalPoint)
    activePointerRef.current = null
    activeStrokeRef.current = []
    canvas.releasePointerCapture?.(event.pointerId)
    onStrokeEnd(points)
  }

  const currentStroke = character.strokes[currentStrokeIndex]
  const fittedBounds = character.fit?.after
  return (
    <canvas
      ref={canvasRef}
      className={`stroke-practice-canvas phase-${phase}`}
      aria-label={`${character.character} 글자 ${currentStrokeIndex + 1}번째 획, 전체 ${character.strokes.length}획. 시작점에서 화살표 방향으로 따라 쓰세요.`}
      role="img"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={(event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (activePointerRef.current === event.pointerId) {
          activePointerRef.current = null
          activeStrokeRef.current = []
        }
      }}
      onContextMenu={(event: { preventDefault(): void }) => event.preventDefault()}
      data-current-stroke-id={currentStroke?.id}
      data-canonical-stroke-source={CANONICAL_STROKE_RENDERING_MARKER}
      data-canonical-stroke-count={character.strokes.length}
      data-glyph-layout-type={character.layoutType ?? 'jamo'}
      data-glyph-final-kind={character.finalKind ?? 'none'}
      data-glyph-fit-scale={character.fit?.scale.toFixed(4)}
      data-glyph-fit-usage-x={character.fit?.usageX.toFixed(4)}
      data-glyph-fit-usage-y={character.fit?.usageY.toFixed(4)}
      data-glyph-center-x={fittedBounds?.centerX.toFixed(4)}
      data-glyph-center-y={fittedBounds?.centerY.toFixed(4)}
      data-glyph-width={fittedBounds?.width.toFixed(4)}
      data-glyph-height={fittedBounds?.height.toFixed(4)}
      data-glyph-override={character.overrideKey ?? 'none'}
    />
  )
}
