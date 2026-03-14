<script>
  import { onMount, onDestroy } from 'svelte'
  import { settings } from '../settings-store.svelte.js'

  let loadTime = $state(0)
  let latency = $state(null)
  let viewportWidth = $state(0)
  let viewportHeight = $state(0)
  let fps = $state(0)

  let frameCount = 0, lastTime = 0, fpsAnimationId = null, perfObserver = null

  function updateFPS() {
    frameCount++
    const currentTime = performance.now()
    if (currentTime >= lastTime + 1000) {
      fps = frameCount; frameCount = 0; lastTime = currentTime
    }
    fpsAnimationId = requestAnimationFrame(updateFPS)
  }

  function startFPS() {
    if (!fpsAnimationId) { frameCount = 0; lastTime = performance.now(); updateFPS() }
  }

  function stopFPS() {
    if (fpsAnimationId) { cancelAnimationFrame(fpsAnimationId); fpsAnimationId = null; fps = 0 }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') { startFPS(); measurePing() }
    else stopFPS()
  }

  async function measurePing() {
    if (!settings.pingUrl) { latency = null; return }
    const start = performance.now()
    try {
      await fetch(settings.pingUrl, { method: 'GET', mode: 'no-cors', cache: 'no-cache' })
      latency = Math.round(performance.now() - start)
    } catch { latency = null }
  }

  function updateViewportSize() {
    viewportWidth = window.innerWidth; viewportHeight = window.innerHeight
  }

  onMount(() => {
    measurePing(); updateViewportSize(); startFPS()
    perfObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      if (entries.length > 0) loadTime = Math.round(entries[0].toJSON().duration)
    })
    perfObserver.observe({ type: 'navigation', buffered: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('resize', updateViewportSize)
  })

  onDestroy(() => {
    stopFPS()
    if (perfObserver) perfObserver.disconnect()
    window.removeEventListener('resize', updateViewportSize)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
</script>

<div class="panel-wrapper">
  <div class="panel-label">stats</div>
  <div class="panel">
    <div>load <span class="bright">{loadTime} ms</span></div>
    <div>ping <span class="bright">{settings.pingUrl ? (latency ?? '?') + ' ms' : '-'}</span></div>
    <div>fps <span class="bright">{fps}</span></div>
    <div><span class="bright">{viewportWidth}</span> x <span class="bright">{viewportHeight}</span></div>
  </div>
</div>
