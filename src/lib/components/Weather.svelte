<script>
  import { onMount, onDestroy, untrack } from 'svelte'
  import WeatherAPI from '../weather-api.js'
  import { settings } from '../settings-store.svelte.js'

  let current = $state(null)
  let forecast = $state([])
  let loading = $state(false)
  let error = $state(null)
  let initialLoad = $state(true)
  let prevForecastMode = $state(settings.forecastMode)

  const weatherAPI = new WeatherAPI()

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') loadWeather()
  }

  $effect(() => {
    const _lat = settings.latitude, _lon = settings.longitude
    const _lm = settings.locationMode, _tu = settings.tempUnit
    const _su = settings.speedUnit, _tf = settings.timeFormat
    const forecastMode = settings.forecastMode

    if (untrack(() => initialLoad)) {
      initialLoad = false; prevForecastMode = forecastMode; return
    }
    if (untrack(() => prevForecastMode) !== forecastMode) {
      prevForecastMode = forecastMode; weatherAPI.clearCache()
    }
    refreshWeather()
  })

  async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('geolocation not supported')); return }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude: Math.round(pos.coords.latitude * 100) / 100,
          longitude: Math.round(pos.coords.longitude * 100) / 100,
        }),
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      )
    })
  }

  async function getIpLocation() {
    const r = await fetch('https://ipapi.co/json/')
    if (!r.ok) throw new Error('ip location request failed')

    const d = await r.json()
    if (typeof d.latitude !== 'number' || typeof d.longitude !== 'number') {
      throw new Error('invalid ip location response')
    }

    return {
      latitude: Math.round(d.latitude * 100) / 100,
      longitude: Math.round(d.longitude * 100) / 100,
    }
  }

  export async function loadWeather() {
    error = null
    loading = true
    let lat = settings.latitude, lon = settings.longitude

    if (settings.locationMode === 'auto') {
      try {
        const loc = await getCurrentLocation()
        lat = loc.latitude; lon = loc.longitude
      } catch {
        // fallback to IP
        try {
          const loc = await getIpLocation()
          lat = loc.latitude; lon = loc.longitude
        } catch {
          error = 'location unavailable'; loading = false; return
        }
      }
    }

    if (lat === null || lon === null) {
      error = 'set location in settings'; loading = false; return
    }

    const cached = weatherAPI.getCachedWeather(settings.timeFormat, lat, lon, settings.forecastMode)
    if (cached.data) {
      current = cached.data.current; forecast = cached.data.forecast
      if (!cached.isStale) { error = null; loading = false; return }
    }

    try {
      error = null
      const data = await weatherAPI.getWeather(lat, lon, settings.tempUnit, settings.speedUnit, settings.timeFormat, settings.forecastMode)
      current = data.current; forecast = data.forecast
    } catch {
      error = 'failed to load weather'
    } finally {
      loading = false
    }
  }

  export function refreshWeather() {
    weatherAPI.clearCache(); loadWeather()
  }

  onMount(() => {
    loadWeather()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })
  onDestroy(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
</script>

<div class="panel-wrapper">
  <button class="widget-label" onclick={refreshWeather} disabled={loading}>
    {loading ? 'loading...' : 'weather'}
  </button>
  <div class="panel">
    {#if error}
      <div class="error">{error}</div>
    {:else if current}
      <div class="temp">{current.temperature_2m}°</div>
      <div class="description">{current.description}</div>
      <br />
      <div class="stats">
        <div class="col">
          <div>humi <span class="bright">{current.relative_humidity_2m}%</span></div>
          <div>prec <span class="bright">{current.precipitation_probability}%</span></div>
        </div>
        <div class="col">
          <div>wind <span class="bright">{current.wind_speed_10m} {settings.speedUnit}</span></div>
          <div>feel <span class="bright">{current.apparent_temperature}°</span></div>
        </div>
      </div>
      <br />
      <div class="forecast">
        <div class="col">
          {#each forecast as f}<div class="forecast-time">{f.formattedTime}</div>{/each}
        </div>
        <div class="col">
          {#each forecast as f}
            <div class="forecast-temp">
              {#if settings.forecastMode === 'daily'}
                {f.temperatureMax}° <span class="sep">/</span> {f.temperatureMin}°
              {:else}
                {f.temperature}°
              {/if}
            </div>
          {/each}
        </div>
        <div class="col">
          {#each forecast as f}<div class="forecast-weather">{f.description}</div>{/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .temp { font-size: 2rem; font-weight: 300; color: var(--txt-1); line-height: 2.625rem; }
  .description { font-size: 1.25rem; color: var(--txt-3); }
  .stats, .forecast { display: flex; gap: 1.5rem; }
  .forecast-time { text-align: end; white-space: nowrap; }
  .forecast-temp { text-align: end; color: var(--txt-1); white-space: nowrap; min-width: 5rem; }
  .sep { color: var(--txt-3); }
  .forecast-weather { color: var(--txt-3); white-space: nowrap; }
</style>
