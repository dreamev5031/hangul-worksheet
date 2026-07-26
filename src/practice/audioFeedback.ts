import type { AudioFeedbackController, AudioFeedbackKind, AudioTone } from './types'

export const FEEDBACK_TONES: Record<AudioFeedbackKind, AudioTone[]> = {
  'stroke-success': [
    { frequency: 880, start: 0, duration: 0.12, gain: 0.055, type: 'sine' },
  ],
  retry: [
    { frequency: 330, start: 0, duration: 0.1, gain: 0.035, type: 'sine' },
  ],
  'character-complete': [
    { frequency: 659, start: 0, duration: 0.12, gain: 0.05, type: 'sine' },
    { frequency: 880, start: 0.12, duration: 0.14, gain: 0.055, type: 'sine' },
  ],
  'session-complete': [
    { frequency: 523, start: 0, duration: 0.12, gain: 0.05, type: 'sine' },
    { frequency: 659, start: 0.12, duration: 0.12, gain: 0.05, type: 'sine' },
    { frequency: 784, start: 0.24, duration: 0.16, gain: 0.055, type: 'sine' },
  ],
}

type AudioContextLike = AudioContext

type AudioContextFactory = () => AudioContextLike

export function createAudioFeedbackController(
  initialMuted = false,
  contextFactory: AudioContextFactory = () => {
    const Constructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Constructor) throw new Error('AudioContext unavailable')
    return new Constructor()
  },
): AudioFeedbackController {
  let context: AudioContextLike | null = null
  let muted = initialMuted
  let disposed = false

  const ensureContext = async (): Promise<boolean> => {
    if (disposed || muted) return false
    try {
      context ??= contextFactory()
      if (context.state === 'suspended') await context.resume()
      return context.state !== 'closed'
    } catch {
      return false
    }
  }

  const play = (kind: AudioFeedbackKind) => {
    if (muted || disposed) return
    void ensureContext().then((ready) => {
      if (!ready || !context) return
      const now = context.currentTime
      FEEDBACK_TONES[kind].forEach((tone) => {
        try {
          const oscillator = context?.createOscillator()
          const gain = context?.createGain()
          if (!oscillator || !gain || !context) return
          oscillator.type = tone.type ?? 'sine'
          oscillator.frequency.setValueAtTime(tone.frequency, now + tone.start)
          gain.gain.setValueAtTime(0.0001, now + tone.start)
          gain.gain.exponentialRampToValueAtTime(tone.gain, now + tone.start + 0.012)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.start + tone.duration)
          oscillator.connect(gain)
          gain.connect(context.destination)
          oscillator.start(now + tone.start)
          oscillator.stop(now + tone.start + tone.duration + 0.02)
        } catch {
          // Audio feedback is optional and never blocks the session.
        }
      })
    })
  }

  return {
    unlock: ensureContext,
    play,
    setMuted(nextMuted) { muted = nextMuted },
    isMuted: () => muted,
    dispose() {
      disposed = true
      if (context && context.state !== 'closed') void context.close().catch(() => undefined)
      context = null
    },
  }
}
