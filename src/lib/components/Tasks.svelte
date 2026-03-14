<script>
  import { onMount, onDestroy } from 'svelte'
  import LocalStorageBackend from '../localstorage-backend.js'
  import { settings } from '../settings-store.svelte.js'
  import { parseSmartDate, stripDateMatch, formatTaskDue } from '../date-matcher.js'

  let api = $state(null)
  let tasks = $state([])
  let syncing = $state(true)
  let error = $state('')
  let newTaskContent = $state('')
  let addingTask = $state(false)
  let togglingTasks = $state(new Set())
  let editBuffer = $state({})
  let inputEl = $state()

  const taskCount = $derived(tasks.filter(t => !t.checked).length)
  const taskLabel = $derived(taskCount === 1 ? 'task' : 'tasks')

  const parsedDate = $derived(
    parseSmartDate(newTaskContent, { dateFormat: settings.dateFormat })
  )

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && api) loadTasks()
  }

  function handleGlobalKeydown(e) {
    const active = document.activeElement
    const isInput = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA'
    if (inputEl && !isInput && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      inputEl.focus()
    }
  }

  async function loadTasks(showSyncing = false) {
    try {
      if (showSyncing) syncing = true
      error = ''
      await api.sync()
      tasks = api.getTasks()
      const newBuf = {}
      tasks.forEach(t => { newBuf[t.id] = editBuffer[t.id] ?? t.content ?? '' })
      editBuffer = newBuf
    } catch { error = 'failed to sync tasks' }
    finally { if (showSyncing) syncing = false }
  }

  async function addTask(e) {
    e.preventDefault()
    const raw = newTaskContent.trim()
    if (!raw || !api || addingTask) return
    let content = raw, due = null
    if (parsedDate?.match) {
      content = stripDateMatch(content, parsedDate.match) || content
      due = formatTaskDue(parsedDate.date, parsedDate.hasTime)
    }
    try {
      addingTask = true
      await api.addTask(content, due)
      newTaskContent = ''
      await loadTasks()
    } catch { } finally { addingTask = false }
  }

  async function toggleTask(taskId, checked) {
    if (togglingTasks.has(taskId)) return
    const prev = [...tasks]
    try {
      togglingTasks.add(taskId)
      tasks = tasks.map(t => t.id === taskId ? { ...t, checked, completed_at: checked ? new Date().toISOString() : null } : t)
      if (checked) await api.completeTask(taskId)
      else await api.uncompleteTask(taskId)
      await loadTasks()
    } catch { tasks = prev; await loadTasks() }
    finally { togglingTasks.delete(taskId) }
  }

  async function deleteTask(taskId) {
    if (!api) return
    tasks = tasks.filter(t => t.id !== taskId)
    try { await api.deleteTask(taskId); await loadTasks() }
    catch { await loadTasks() }
  }

  async function commitEdit(taskId) {
    if (!api) return
    const newContent = (editBuffer[taskId] ?? '').trim()
    const original = tasks.find(t => t.id === taskId)?.content ?? ''
    if (!newContent || newContent === original) return
    try { await api.editTaskName(taskId, newContent); await loadTasks() }
    catch { await loadTasks() }
  }

  function isOverdue(task) {
    if (!task.due || task.checked) return false
    return task.due_date.getTime() < new Date().getTime()
  }

  function formatDue(date, hasTime) {
    if (!date) return ''
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dd = new Date(date)
    const ddOnly = new Date(dd.getFullYear(), dd.getMonth(), dd.getDate())
    const diff = Math.ceil((ddOnly - today) / 86400000)
    let s = diff === -1 ? 'yesterday' : diff === 0 ? 'today' : diff === 1 ? 'tmrw'
      : diff < 7 ? dd.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
      : dd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase()
    if (hasTime) {
      s += ' ' + dd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: settings.timeFormat === '12hr' }).toLowerCase()
    }
    return s
  }

  onMount(() => {
    api = new LocalStorageBackend({})
    loadTasks(true)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('keydown', handleGlobalKeydown)
  })

  onDestroy(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    document.removeEventListener('keydown', handleGlobalKeydown)
  })
</script>

<div class="panel-wrapper">
  <button class="widget-label" onclick={() => loadTasks(true)} disabled={syncing}>
    {syncing ? 'syncing...' : 'tasks'}
  </button>
  <div class="panel">
    {#if error}
      <div class="error">{error}</div>
    {:else}
      <div class="widget-header">
        <span class="task-count"><span class="bright">{taskCount}</span> {taskLabel}</span>
        <form class="add-form" class:show={tasks.length === 0} onsubmit={addTask}>
          <span class="dark">+</span>
          <input
            bind:this={inputEl}
            bind:value={newTaskContent}
            placeholder="new task"
            disabled={addingTask}
            class="add-input"
            autocomplete="off"
          />
        </form>
      </div>
      <br />
      <div class="tasks">
        {#each tasks as task (task.id)}
          <div class="task" class:completed={task.checked}>
            <button class="checkbox" onclick={() => toggleTask(task.id, !task.checked)}>
              {#if task.checked}[<span class="checkbox-x">x</span>]{:else}[ ]{/if}
            </button>
            <span class="task-title">
              <input
                class="task-title-input"
                bind:value={editBuffer[task.id]}
                onblur={() => commitEdit(task.id)}
                onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur() } }}
                aria-label="edit task"
              />
            </span>
            {#if task.due_date}
              <span class="task-due" class:overdue={isOverdue(task)}>
                {formatDue(task.due_date, task.has_time)}
              </span>
            {/if}
            <button class="task-delete" onclick={() => deleteTask(task.id)}>x</button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .panel-wrapper { flex: 1; height: 100%; }
  .widget-header { display: flex; gap: 1ch; align-items: center; flex-wrap: nowrap; white-space: nowrap; }
  .add-form {
    opacity: 0; display: flex; gap: 1ch; flex: 1; align-items: center;
    &:hover, &:focus-within { opacity: 1; }
    &.show { opacity: 1; }
  }
  .add-input {
    flex: 1; background: transparent; border: none;
    color: var(--txt-2); caret-color: var(--txt-1);
    &::placeholder { color: var(--txt-3); }
    &:disabled { opacity: 0.5; }
  }
  .task-count { white-space: nowrap; flex-shrink: 0; }
  .tasks { max-height: 15rem; overflow: auto; scrollbar-width: none; }
  .task {
    display: flex; align-items: baseline; gap: 1ch;
    max-width: 40rem; white-space: nowrap;
  }
  .task-title { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .task-title-input {
    all: unset; display: inline-block; width: 100%;
    min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .task.completed .task-title-input { text-decoration: line-through; }
  .task-due { color: var(--txt-3); margin-left: 3ch; }
  .overdue { color: var(--txt-err); }
  .task-delete { opacity: 0; pointer-events: none; }
  .task:hover .task-delete, .task:focus-within .task-delete {
    opacity: 1; pointer-events: auto;
  }
  .checkbox-x { color: var(--txt-2); }
</style>
