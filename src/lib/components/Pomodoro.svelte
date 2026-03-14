<script>
  import { onDestroy } from 'svelte'
  import { settings, saveSettings } from '../settings-store.svelte.js'

  // session types
  const TYPES = { focus: 'focus', short: 'short break', long: 'long break' }

  let sessionType = $state('focus')
  let sessionNum = $state(1)
  let timeLeft = $state(settings.pomFocusDuration * 60)
  let running = $state(false)
  let finished = $state(false)
  let interval = null

  // sync timeLeft when settings change and timer is not running
  $effect(() => {
    if (!running) {
      if (sessionType === 'focus') timeLeft = settings.pomFocusDuration * 60
      else if (sessionType === 'short') timeLeft = settings.pomShortBreakDuration * 60
      else timeLeft = settings.pomLongBreakDuration * 60
    }
  })

  const totalSessions = $derived(settings.pomSessions)

  const display = $derived(() => {
    const m = Math.floor(timeLeft / 60)
    const s = timeLeft % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  // Web Audio API sound synthesis
  function getAudioCtx() {
    if (!window._pomAudioCtx) window._pomAudioCtx = new (window.AudioContext || window.webkitAudioContext)()
    return window._pomAudioCtx
  }

  function playSound(type) {
    if (type === 'none') return
    try {
      const ctx = getAudioCtx()
      const sounds = {
        chime:     [{ f: 523, t: 0, d: 0.4 }, { f: 659, t: 0.15, d: 0.4 }, { f: 784, t: 0.3, d: 0.6 }],
        beep:      [{ f: 880, t: 0, d: 0.15 }, { f: 880, t: 0.2, d: 0.15 }],
        bell:      [{ f: 440, t: 0, d: 1.2 }, { f: 880, t: 0.05, d: 0.8 }],
        'soft ping': [{ f: 660, t: 0, d: 0.5 }],
      }
      const notes = sounds[type] || sounds['soft ping']
      notes.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = f
        osc.type = type === 'beep' ? 'square' : 'sine'
        const start = ctx.currentTime + t
        gain.gain.setValueAtTime(0.3, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + d)
        osc.start(start)
        osc.stop(start + d)
      })
    } catch {}
  }

  function tick() {
    if (timeLeft <= 0) {
      clearInterval(interval)
      interval = null
      running = false
      onSessionEnd()
      return
    }
    timeLeft--
  }

  function onSessionEnd() {
    const isLastSession = sessionType === 'focus' && sessionNum >= totalSessions
    if (isLastSession) {
      // all done
      finished = true
      playSound(settings.pomSoundAllDone)
      sessionType = 'focus'
      sessionNum = 1
      timeLeft = settings.pomFocusDuration * 60
      return
    }

    if (sessionType === 'focus') {
      // advance to break
      const isLong = sessionNum % totalSessions === 0
      sessionType = isLong ? 'long' : 'short'
      timeLeft = isLong ? settings.pomLongBreakDuration * 60 : settings.pomShortBreakDuration * 60
      playSound(settings.pomSoundBreakStart)
      if (settings.pomAutoStartBreaks) startTimer()
    } else {
      // advance to focus
      if (sessionType === 'short') sessionNum++
      sessionType = 'focus'
      timeLeft = settings.pomFocusDuration * 60
      playSound(settings.pomSoundFocusStart)
      if (settings.pomAutoStartFocus) startTimer()
    }
  }

  function startTimer() {
    if (running) return
    finished = false
    running = true
    interval = setInterval(tick, 1000)
  }

  function pauseTimer() {
    running = false
    clearInterval(interval)
    interval = null
  }

  function toggleTimer() {
    if (running) pauseTimer()
    else startTimer()
  }

  function resetTimer() {
    pauseTimer()
    finished = false
    sessionType = 'focus'
    sessionNum = 1
    timeLeft = settings.pomFocusDuration * 60
  }

  function skipSession() {
    pauseTimer()
    finished = false
    onSessionEnd()
  }

  onDestroy(() => {
    if (interval) clearInterval(interval)
  })
</script>

<div class="panel-wrapper">
  <div class="panel-label">pomodoro</div>
  <div class="panel">
    <div class="pom-inner">
      <div class="pom-left">
        <div class="pom-top">
          <span class="mode">{TYPES[sessionType]}</span>
          <span class="session">{sessionNum} / {totalSessions}</span>
          {#if finished}<span class="done">all done!</span>{/if}
        </div>
        <div class="timer" class:running>{display()}</div>
      </div>
      <div class="controls">
        <button onclick={toggleTimer}>
          [{running ? 'pause' : 'start'}]
        </button>
        <button onclick={resetTimer}>[reset]</button>
        <button onclick={skipSession}>[skip]</button>
      </div>
    </div>
  </div>
</div>

<style>
  .panel-wrapper { width: 100%; }
  .pom-inner {
    display: flex;
    align-items: center;
    gap: 3rem;
  }
  .pom-left {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .pom-top {
    display: flex;
    align-items: baseline;
    gap: 1rem;
  }
  .mode {
    font-size: 0.75rem;
    color: var(--txt-4);
    letter-spacing: 0.04em;
  }
  .session {
    font-size: 0.75rem;
    color: var(--txt-4);
  }
  .done {
    font-size: 0.75rem;
    color: var(--txt-err);
  }
  .timer {
    font-size: 2.4rem;
    font-weight: 300;
    color: var(--txt-1);
    letter-spacing: -0.01em;
    line-height: 1;
    transition: color 0.3s;
  }
  .timer.running {
    color: var(--txt-1);
  }
  .controls {
    display: flex;
    gap: 1.2rem;
    align-items: center;
  }
  .controls button {
    font-size: 0.82rem;
    white-space: nowrap;
    color: var(--txt-3);
  }
  .controls button:hover {
    color: var(--txt-1);
  }
</style>
