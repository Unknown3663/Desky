<script>
  import './app.css'
  import { settings, saveSettings } from './lib/settings-store.svelte.js'
  import DateTime from './lib/components/DateTime.svelte'
  import Stats from './lib/components/Stats.svelte'
  import Weather from './lib/components/Weather.svelte'
  import Tasks from './lib/components/Tasks.svelte'
  import Settings from './lib/components/Settings.svelte'
  import Pomodoro from './lib/components/Pomodoro.svelte'
  import Titlebar from './lib/components/Titlebar.svelte'

  // Only render Titlebar when running in a Tauri environment to avoid
  // referencing Tauri globals on web/non-Tauri builds.
  const isTauri = typeof window !== 'undefined' && !!window.__TAURI__

  let showSettings = $state(false)

  const needsConfig = $derived(
    settings.locationMode === 'manual' &&
    (settings.latitude === null || settings.longitude === null)
  )

  $effect(() => {
    document.documentElement.className = 'theme-' + (settings.currentTheme || 'default')
  })

  $effect(() => {
    document.documentElement.style.setProperty('--font-family', `'${settings.font || 'Geist Mono'}', monospace`)
  })

  $effect(() => {
    let el = document.getElementById('custom-css')
    if (!el) { el = document.createElement('style'); el.id = 'custom-css'; document.head.appendChild(el) }
    el.textContent = settings.customCSS || ''
  })

  $effect(() => { saveSettings(settings) })
</script>

{#if isTauri}
  <Titlebar />
{/if}

<main>
  <div class="container">

    {#if settings.showClock}
      <div class="datetime"><DateTime /></div>
    {/if}
    {#if settings.showStats}
      <div class="stats"><Stats /></div>
    {/if}
    {#if settings.showWeather}
      <div class="weather"><Weather /></div>
    {/if}
    {#if settings.showTasks}
      <div class="tasks"><Tasks /></div>
    {/if}
    {#if settings.showPomodoro}
      <div class="pomodoro"><Pomodoro /></div>
    {/if}

  </div>

  <button
    class="settings-btn"
    class:needs-config={needsConfig}
    onclick={() => showSettings = true}
  >
    settings
  </button>

  <Settings {showSettings} closeSettings={() => showSettings = false} />
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    justify-content: center;
    align-items: center;
    padding: calc(1.5rem + var(--titlebar-height)) 1rem 1.5rem 1rem;
  }

  .container {
    display: grid;
    grid-template-columns: 1fr 1fr 140px;
    grid-template-rows: auto auto auto;
    gap: 1.2rem;
    width: min(760px, 92vw);
  }

  .datetime {
    grid-column: 1 / 3;
    grid-row: 1;
  }
  .stats {
    grid-column: 3;
    grid-row: 1;
  }
  .weather {
    grid-column: 1;
    grid-row: 2;
  }
  .tasks {
    grid-column: 2 / 4;
    grid-row: 2;
  }
  .pomodoro {
    grid-column: 1 / 4;
    grid-row: 3;
  }
  .datetime, .stats, .weather, .tasks {
    min-width: 0;
  }
  .datetime :global(.panel-wrapper),
  .stats :global(.panel-wrapper),
  .weather :global(.panel-wrapper),
  .tasks :global(.panel-wrapper) {
    height: 100%;
  }
  .datetime :global(.panel),
  .stats :global(.panel),
  .weather :global(.panel),
  .tasks :global(.panel) {
    height: 100%;
    box-sizing: border-box;
  }

  .settings-btn {
    position: fixed; top: var(--titlebar-height); right: 0;
    padding: 1rem 1.5rem;
    opacity: 0; z-index: 100; color: var(--txt-3);
    &:hover { opacity: 1; }
  }
  .settings-btn.needs-config {
    opacity: 1;
    animation: pulse 1s ease-in-out infinite;
    &:hover { animation: none; }
  }
</style>
