<script>
  import { settings, saveSettings, resetSettings, exportSettings, importSettings, defaultCustomColors } from '../settings-store.svelte.js'

  let { showSettings = false, closeSettings } = $props()

  const THEMES = [
    { id: 'default', label: 'default', colors: ['oklch(40% 0 0)', 'oklch(75% 0 0)'] },
    { id: 'rose-pine', label: 'rosé pine', colors: ['#ebbcba', '#e0def4'] },
    { id: 'catppuccin-mocha', label: 'catppuccin mocha', colors: ['#cba6f7', '#a6adc8'] },
    { id: 'catppuccin-latte', label: 'catppuccin latte', colors: ['#7287fd', '#4c4f69'] },
    { id: 'nord', label: 'nord', colors: ['#88c0d0', '#d8dee9'] },
    { id: 'tokyo-night', label: 'tokyo night', colors: ['#7aa2f7', '#a9b1d6'] },
    { id: 'gruvbox', label: 'gruvbox', colors: ['#fabd2f', '#d5c4a1'] },
    { id: 'everforest', label: 'everforest', colors: ['#a7c080', 'hsl(41,20%,65%)'] },
  ]

  let fileInput = $state()

  function set(field, val) { settings[field] = val; saveSettings(settings) }

  function addLink() {
    settings.links = [...(settings.links || []), { id: Date.now(), title: '', url: '' }]
    saveSettings(settings)
  }

  function removeLink(id) {
    settings.links = settings.links.filter(l => l.id !== id)
    saveSettings(settings)
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (file) importSettings(file)
  }

  function previewSound(type) {
    if (type === 'none') return
    try {
      if (!window._pomAudioCtx) window._pomAudioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = window._pomAudioCtx
      const sounds = {
        chime:       [{ f: 523, t: 0, d: 0.4 }, { f: 659, t: 0.15, d: 0.4 }, { f: 784, t: 0.3, d: 0.6 }],
        beep:        [{ f: 880, t: 0, d: 0.15 }, { f: 880, t: 0.2, d: 0.15 }],
        bell:        [{ f: 440, t: 0, d: 1.2 }, { f: 880, t: 0.05, d: 0.8 }],
        'soft ping': [{ f: 660, t: 0, d: 0.5 }],
      }
      const notes = sounds[type] || sounds['soft ping']
      notes.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.value = f
        osc.type = type === 'beep' ? 'square' : 'sine'
        const start = ctx.currentTime + t
        gain.gain.setValueAtTime(0.3, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + d)
        osc.start(start); osc.stop(start + d)
      })
    } catch {}
  }

  function handleReset() {
    if (confirm('reset all settings to defaults?')) resetSettings()
  }
</script>

{#if showSettings}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="overlay" onclick={closeSettings}></div>
{/if}

<div class="drawer" class:open={showSettings}>
  <div class="drawer-header">
    <span>settings</span>
    <button onclick={closeSettings}>x</button>
  </div>

  <div class="drawer-body">

    <section>
      <div class="label">widgets</div>
      <div class="row wrap">
        {#each ['showClock','showStats','showWeather','showTasks'] as w}
          <button onclick={() => { settings[w] = !settings[w]; saveSettings(settings) }}>
            {settings[w] ? '[x]' : '[ ]'} {w.replace('show','').toLowerCase()}
          </button>
        {/each}
      </div>
    </section>

    <section>
      <div class="label">theme</div>
      <div class="theme-grid">
        {#each THEMES as t}
          <button class="theme-btn" onclick={() => set('currentTheme', t.id)}>
            <span>{settings.currentTheme === t.id ? '[x]' : '[ ]'}</span>
            <span class="swatch">
              <span style="background:{t.colors[0]}"></span>
              <span style="background:{t.colors[1]}"></span>
            </span>
            <span>{t.label}</span>
          </button>
        {/each}
      </div>
    </section>

    <section>
      <div class="label">font</div>
      <input class="text-input" value={settings.font}
        oninput={e => set('font', e.target.value)} />
    </section>

    <section>
      <div class="label">time format</div>
      <div class="row">
        <button onclick={() => set('timeFormat','12hr')}>{settings.timeFormat==='12hr'?'[x]':'[ ]'} 12 hour</button>
        <button onclick={() => set('timeFormat','24hr')}>{settings.timeFormat==='24hr'?'[x]':'[ ]'} 24 hour</button>
      </div>
    </section>

    <section>
      <div class="label">date format</div>
      <div class="row">
        <button onclick={() => set('dateFormat','mdy')}>{settings.dateFormat==='mdy'?'[x]':'[ ]'} month-day-year</button>
        <button onclick={() => set('dateFormat','dmy')}>{settings.dateFormat==='dmy'?'[x]':'[ ]'} day-month-year</button>
      </div>
    </section>

    <section>
      <div class="label">temperature format</div>
      <div class="row">
        <button onclick={() => set('tempUnit','fahrenheit')}>{settings.tempUnit==='fahrenheit'?'[x]':'[ ]'} fahrenheit</button>
        <button onclick={() => set('tempUnit','celsius')}>{settings.tempUnit==='celsius'?'[x]':'[ ]'} celsius</button>
      </div>
    </section>

    <section>
      <div class="label">speed format</div>
      <div class="row">
        <button onclick={() => set('speedUnit','mph')}>{settings.speedUnit==='mph'?'[x]':'[ ]'} mph</button>
        <button onclick={() => set('speedUnit','kmh')}>{settings.speedUnit==='kmh'?'[x]':'[ ]'} kmh</button>
      </div>
    </section>

    <section>
      <div class="label">weather location</div>
      <div class="row">
        <button onclick={() => set('locationMode','manual')}>{settings.locationMode==='manual'?'[x]':'[ ]'} manual</button>
        <button onclick={() => set('locationMode','auto')}>{settings.locationMode==='auto'?'[x]':'[ ]'} auto</button>
      </div>
      {#if settings.locationMode === 'manual'}
        <div class="row mt">
          <input class="text-input half" placeholder="latitude"
            value={settings.latitude ?? ''}
            oninput={e => set('latitude', e.target.value ? parseFloat(e.target.value) : null)} />
          <input class="text-input half" placeholder="longitude"
            value={settings.longitude ?? ''}
            oninput={e => set('longitude', e.target.value ? parseFloat(e.target.value) : null)} />
        </div>
      {/if}
    </section>

    <section>
      <div class="label">weather forecast</div>
      <div class="row">
        <button onclick={() => set('forecastMode','hourly')}>{settings.forecastMode==='hourly'?'[x]':'[ ]'} hourly</button>
        <button onclick={() => set('forecastMode','daily')}>{settings.forecastMode==='daily'?'[x]':'[ ]'} daily</button>
      </div>
    </section>

    <section>
      <div class="label">ping stats url</div>
      <input class="text-input" value={settings.pingUrl}
        oninput={e => set('pingUrl', e.target.value)} />
    </section>

    <section>
      <div class="label">pomodoro durations</div>
      <div class="col">
        {#each [
          { key: 'pomFocusDuration',       label: 'focus',       max: 120, unit: 'min' },
          { key: 'pomShortBreakDuration',  label: 'short break', max: 60,  unit: 'min' },
          { key: 'pomLongBreakDuration',   label: 'long break',  max: 60,  unit: 'min' },
          { key: 'pomSessions',            label: 'sessions',    max: 10,  unit: 'before long break' },
        ] as d}
          <div class="dur-item">
            <span class="dur-key">{d.label}</span>
            <input class="num-input" type="number" min="1" max={d.max}
              value={settings[d.key]}
              oninput={e => set(d.key, +e.target.value)} />
            <span class="unit">{d.unit}</span>
          </div>
        {/each}
      </div>
    </section>

    <section>
      <div class="label">auto-start</div>
      <div class="row wrap">
        <button onclick={() => set('pomAutoStartFocus', !settings.pomAutoStartFocus)}>
          {settings.pomAutoStartFocus ? '[x]' : '[ ]'} focus sessions
        </button>
        <button onclick={() => set('pomAutoStartBreaks', !settings.pomAutoStartBreaks)}>
          {settings.pomAutoStartBreaks ? '[x]' : '[ ]'} breaks
        </button>
      </div>
    </section>

    <section>
      <div class="label">sound cues</div>
      <div class="col">
        {#each [
          { key: 'pomSoundFocusStart', label: 'focus start' },
          { key: 'pomSoundBreakStart', label: 'break start' },
          { key: 'pomSoundAllDone',    label: 'all done' },
        ] as s}
          <div class="dur-item">
            <span class="dur-key">{s.label}</span>
            <select class="sound-select" value={settings[s.key]}
              onchange={e => set(s.key, e.target.value)}>
              <option value="chime">chime</option>
              <option value="beep">beep</option>
              <option value="bell">bell</option>
              <option value="soft ping">soft ping</option>
              <option value="none">none</option>
            </select>
            <button onclick={() => previewSound(settings[s.key])}>[play]</button>
          </div>
        {/each}
      </div>
    </section>

    <section>
      <div class="label">custom css</div>
      <textarea class="css-input" placeholder="/* add your custom styles here */"
        oninput={e => set('customCSS', e.target.value)}>{settings.customCSS}</textarea>
    </section>

    <section>
      <div class="label">manage settings</div>
      <div class="row wrap">
        <button onclick={() => fileInput.click()}>[import json]</button>
        <button onclick={exportSettings}>[export json]</button>
        <button class="danger" onclick={handleReset}>[reset settings]</button>
      </div>
      <input type="file" accept=".json" bind:this={fileInput} onchange={handleImport} style="display:none" />
    </section>

  </div>
</div>

<style>
  .overlay {
    position: fixed; inset: 0; z-index: 50;
  }
  .drawer {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: min(480px, 100vw);
    background: var(--bg-1);
    border-left: 2px solid var(--bg-3);
    z-index: 100;
    display: flex; flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.2s ease;
    overflow: hidden;
  }
  .drawer.open { transform: translateX(0); }
  .drawer-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1.2rem 1.5rem;
    border-bottom: 2px solid var(--bg-3);
    color: var(--txt-2);
    flex-shrink: 0;
  }
  .drawer-body {
    flex: 1; overflow-y: auto;
    padding: 1.4rem 1.5rem;
    display: flex; flex-direction: column; gap: 1.6rem;
  }
  section { display: flex; flex-direction: column; gap: 0.5rem; }
  .label { font-size: 0.8rem; color: var(--txt-3); }
  .row { display: flex; gap: 1rem; align-items: center; }
  .row.wrap { flex-wrap: wrap; }
  .mt { margin-top: 0.4rem; }
  .theme-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem 0.5rem; }
  .theme-btn { display: flex; align-items: center; gap: 0.5rem; color: var(--txt-2); font-size: inherit; text-align: left; }
  .theme-btn:hover { color: var(--txt-1); }
  .swatch { display: flex; gap: 2px; }
  .swatch span { width: 14px; height: 14px; border-radius: 2px; display: block; }
  .text-input {
    background: var(--bg-2); border: 1px solid var(--bg-3);
    color: var(--txt-2); font-family: inherit; font-size: 0.85rem;
    padding: 0.45rem 0.6rem; width: 100%;
  }
  .text-input:focus { border-color: var(--txt-4); outline: none; }
  .half { flex: 1; width: auto; }
  .css-input {
    background: var(--bg-2); border: 1px solid var(--bg-3);
    color: var(--txt-3); font-family: inherit; font-size: 0.82rem;
    padding: 0.5rem 0.6rem; width: 100%; resize: vertical; min-height: 100px;
  }
  .css-input:focus { border-color: var(--txt-4); color: var(--txt-2); outline: none; }
  .danger:hover { color: var(--txt-err); }
  .col { display: flex; flex-direction: column; gap: 0.5rem; }
  .dur-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.82rem; }
  .dur-key { color: var(--txt-3); min-width: 80px; flex-shrink: 0; }
  .num-input {
    background: var(--bg-2); border: 1px solid var(--bg-3);
    color: var(--txt-2); font-family: inherit; font-size: 0.82rem;
    padding: 0.3rem 0.5rem; width: 56px; outline: none;
  }
  .num-input:focus { border-color: var(--txt-4); }
  .unit { color: var(--txt-4); font-size: 0.78rem; white-space: nowrap; }
  .sound-select {
    width: 100px;
    padding: 0.3rem 1.8rem 0.3rem 0.5rem;
  }
  .sound-select:focus { border-color: var(--txt-4); }
</style>