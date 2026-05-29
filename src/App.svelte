<script>
  import { onMount } from 'svelte'
  import './app.css'
  import { settings, saveSettings } from './lib/settings-store.svelte.js'
  import DateTime from './lib/components/DateTime.svelte'
  import Stats from './lib/components/Stats.svelte'
  import Weather from './lib/components/Weather.svelte'
  import Tasks from './lib/components/Tasks.svelte'
  import Settings from './lib/components/Settings.svelte'
  import Pomodoro from './lib/components/Pomodoro.svelte'
  import Titlebar from './lib/components/Titlebar.svelte'

  let hasDesktopShell = $state(false)
  let showSettings = $state(false)

  const needsConfig = $derived(
    settings.locationMode === 'manual' &&
    (settings.latitude === null || settings.longitude === null)
  )

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.className = 'theme-' + (settings.currentTheme || 'default')
    }
  })

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--font-family', `'${settings.font || 'Geist Mono'}', monospace`)
    }
  })

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--titlebar-height', hasDesktopShell ? '30px' : '0px')
    }
  })

  $effect(() => {
    if (typeof document === 'undefined') return
    let el = document.getElementById('custom-css')
    if (!el) {
      el = document.createElement('style')
      el.id = 'custom-css'
      document.head.appendChild(el)
    }
    el.textContent = settings.customCSS || ''
  })

  $effect(() => { saveSettings(settings) })

  function setShell(active) {
    hasDesktopShell = !!active
    try {
      if (typeof document !== 'undefined') {
        if (hasDesktopShell) document.documentElement.classList.add('tauri-shell')
        else document.documentElement.classList.remove('tauri-shell')
      }
    } catch (err) { console.debug('setShell failed', err) }
  }

  async function probeTauri() {
    // cheap immediate guard
    if (typeof globalThis !== 'undefined' && globalThis.__TAURI__) {
      setShell(true)
      return
    }
    try {
      const core = await import('@tauri-apps/api/core')
      const is = await core.isTauri()
      setShell(!!is)
    } catch (err) {
      // don't pollute console in normal web use, but allow debug visibility
      console.debug('tauri probe failed', err)
      setShell(false)
    }
  }

  onMount(() => {
    probeTauri()
    // small retry in case Tauri injects globals shortly after mount (dev mode)
    setTimeout(probeTauri, 300)
  })
</script>

{#if hasDesktopShell}
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
