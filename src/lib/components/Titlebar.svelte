<script>
  import { onMount } from 'svelte'

  // reactive platform flag
  let isMac = $state(typeof navigator !== 'undefined' && ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '').toLowerCase().includes('mac'))

  let appWindow = $state(null)

  onMount(() => {
    import('@tauri-apps/api/window')
      .then(({ getCurrentWindow }) => {
        appWindow = getCurrentWindow()
        // we rely on navigator as the fallback for platform detection; if we later
        // want Tauri-specific os info we can add it behind another dynamic import
      })
      .catch((err) => { console.debug('tauri window import failed', err); appWindow = null })
  })

  async function minimize() {
    if (!appWindow) return
    try { await appWindow.minimize() } catch (err) { console.debug('minimize failed', err) }
  }

  async function toggleMaximize() {
    if (!appWindow) return
    try { await appWindow.toggleMaximize() } catch (err) { console.debug('toggleMaximize failed', err) }
  }

  async function close() {
    if (!appWindow) return
    try { await appWindow.close() } catch (err) { console.debug('close failed', err) }
  }
</script>

<div class="titlebar" data-tauri-drag-region>
  {#if appWindow && isMac}
    <div class="controls" style="left: 0.5rem" role="toolbar">
      <button aria-label="close" onclick={close}>[x]</button>
      <button aria-label="minimize" onclick={minimize}>[-]</button>
      <button aria-label="maximize" onclick={toggleMaximize}>[+]</button>
    </div>
  {/if}
  <div class="title">Desky</div>
  {#if appWindow && !isMac}
    <div class="controls" style="right: 0.5rem" role="toolbar">
      <button aria-label="minimize" onclick={minimize}>[-]</button>
      <button aria-label="maximize" onclick={toggleMaximize}>[+]</button>
      <button aria-label="close" onclick={close}>[x]</button>
    </div>
  {/if}
</div>

<style>
  /* apply drag region only when running inside Tauri (body will have .tauri-shell) */
  :global(.tauri-shell) .titlebar {
    height: var(--titlebar-height);
    background: var(--bg-1);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.5rem;
    user-select: none;
    -webkit-app-region: drag;
    position: relative;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    position: absolute;
  }

  :global(.tauri-shell) .titlebar .controls button {
    -webkit-app-region: no-drag;
  }

  .title {
    color: var(--txt-3);
    font-size: inherit;
    padding: 0 0.5rem;
    text-align: center;
    flex: 1;
  }

  button {
    font: inherit;
    color: var(--txt-3);
    padding: 0.1rem 0.3rem;
    background: none;
    border: none;
    cursor: pointer;
    line-height: 1;
    transition: color 0.15s ease;
  }

  button:hover {
    color: var(--txt-2);
  }
</style>