<script>
  import { settings } from '../settings-store.svelte.js'

  let now = $state(new Date())
  setInterval(() => now = new Date(), 1000)

  const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december']

  const timeStr = $derived.by(() => {
    if (settings.timeFormat === '24hr') {
      return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
    }
    let h = now.getHours()
    const ampm = h >= 12 ? 'pm' : 'am'
    h = h % 12 || 12
    return `${h}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')} ${ampm}`
  })

  const dateStr = $derived.by(() => {
    const day = DAYS[now.getDay()]
    const month = MONTHS[now.getMonth()]
    const d = now.getDate()
    const y = now.getFullYear()
    return settings.dateFormat === 'dmy'
      ? `${day}, ${d} ${month} ${y}`
      : `${day}, ${month} ${d}, ${y}`
  })
</script>

<div class="panel-wrapper">
  <div class="panel-label">datetime</div>
  <div class="panel">
    <div class="time">{timeStr}</div>
    <div class="date">{dateStr}</div>
  </div>
</div>

<style>
  .time {
    font-size: 2.2rem;
    font-weight: 300;
    color: var(--txt-1);
    letter-spacing: -0.01em;
    line-height: 1.15;
    margin-bottom: 0.2rem;
  }
  .date {
    font-size: 0.9rem;
    color: var(--txt-3);
  }
</style>
