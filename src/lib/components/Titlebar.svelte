<script>
  import { getCurrentWindow } from '@tauri-apps/api/window'

  const isMac = navigator.platform.toLowerCase().includes('mac')

  const appWindow = getCurrentWindow()

  async function minimize() {
    await appWindow.minimize()
  }

  async function toggleMaximize() {
    await appWindow.toggleMaximize()
  }

  async function close() {
    await appWindow.close()
  }
</script>

<div class="titlebar" data-tauri-drag-region>
  {#if isMac}
    <div class="controls" style="left: 0.5rem">
      <button onclick={close}>[x]</button>
      <button onclick={minimize}>[-]</button>
      <button onclick={toggleMaximize}>[+]</button>
    </div>
  {/if}
  <div class="title">Desky</div>
  {#if !isMac}
    <div class="controls" style="right: 0.5rem">
      <button onclick={minimize}>[-]</button>
      <button onclick={toggleMaximize}>[+]</button>
      <button onclick={close}>[x]</button>
    </div>
  {/if}
</div>

<style>
  .titlebar {
    height: 30px;
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

  :global(.titlebar .controls button) {
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
  }

  button:hover {
    color: var(--txt-2);
  }
</style>