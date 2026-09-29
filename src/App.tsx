import { useMemo, useState } from 'react'
import AddTodoForm from './components/AddTodoForm'
import AnalyticsPanel from './components/AnalyticsPanel'
import SearchBar from './components/SearchBar'
import TodoItem from './components/TodoItem'
import TodoSection from './components/TodoSection'
import UndoToast from './components/UndoToast'
import { useTheme } from './hooks/useTheme'
import { isPastDue, useTodos } from './hooks/useTodos'
import { compareKeys } from './dates'
import type { Todo } from './types'

type View = 'all' | 'upcoming' | 'past'

const NAV: { id: View; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
]

/** Today's date, formatted for the header. Computed once per module load. */
const TODAY_LABEL = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

function sortUpcoming(list: Todo[]): Todo[] {
  return [...list].sort(
    (a, b) => compareKeys(a.dueDate, b.dueDate) || b.createdAt - a.createdAt,
  )
}

function sortPast(list: Todo[]): Todo[] {
  return [...list].sort((a, b) => {
    // Completed items first (most recent completion on top), then overdue (most overdue on top).
    if (a.done !== b.done) return a.done ? -1 : 1
    if (a.done && b.done) return (b.completedAt ?? 0) - (a.completedAt ?? 0)
    return compareKeys(a.dueDate, b.dueDate)
  })
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const [view, setView] = useState<View>('all')
  const [query, setQuery] = useState('')
  const {
    todos,
    addTodo,
    editTodo,
    toggleTodo,
    deleteTodo,
    restoreTodos,
    clearHistory,
    undo,
  } = useTodos()

  const searching = query.trim().length > 0

  // Global counts for the sidebar — always reflect the full list, never the search.
  const { globalUpcoming, globalPast, overdueCount, doneCount } = useMemo(() => {
    const open = todos.filter((t) => !t.done)
    const upcoming = open.filter((t) => !isPastDue(t))
    const past = todos.filter((t) => t.done || isPastDue(t))
    return {
      globalUpcoming: upcoming.length,
      globalPast: past.length,
      overdueCount: open.filter(isPastDue).length,
      doneCount: past.filter((t) => t.done).length,
    }
  }, [todos])

  // Lists shown on the board: the current view's items, or search matches across everything.
  const { upcoming, past } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const source =
      q !== '' ? todos.filter((t) => t.text.toLowerCase().includes(q)) : todos
    return {
      upcoming: sortUpcoming(source.filter((t) => !t.done && !isPastDue(t))),
      past: sortPast(source.filter((t) => t.done || isPastDue(t))),
    }
  }, [todos, query])

  const itemProps = {
    onToggle: toggleTodo,
    onDelete: deleteTodo,
    onEdit: editTodo,
  }

  const showUpcoming = searching || view !== 'past'
  const showPast = searching || view !== 'upcoming'
  const viewTitle = NAV.find((n) => n.id === view)?.label ?? 'All'
  const totalMatches = upcoming.length + past.length

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Todo</span>
        </div>

        <nav className="side-nav" aria-label="Views">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`nav-item ${!searching && view === n.id ? 'active' : ''}`}
              onClick={() => {
                setView(n.id)
                setQuery('')
              }}
              aria-current={!searching && view === n.id ? 'page' : undefined}
            >
              <span>{n.label}</span>
              <span className="nav-count">
                {n.id === 'upcoming'
                  ? globalUpcoming
                  : n.id === 'past'
                    ? globalPast
                    : todos.length}
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-stats">
            {todos.length === 0
              ? 'No todos yet'
              : `${globalUpcoming} open · ${overdueCount} overdue · ${doneCount} done`}
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="main-header">
          <div>
            {searching ? (
              <>
                <h1>Search</h1>
                <p className="main-date">
                  {totalMatches === 0
                    ? `No matches for “${query.trim()}”`
                    : `${totalMatches} ${totalMatches === 1 ? 'match' : 'matches'} for “${query.trim()}”`}
                </p>
              </>
            ) : (
              <>
                <h1>{viewTitle}</h1>
                <p className="main-date">{TODAY_LABEL}</p>
              </>
            )}
          </div>
          <SearchBar query={query} onChange={setQuery} />
        </header>

        <AddTodoForm onAdd={addTodo} />

        <AnalyticsPanel todos={todos} />

        <div className={`board ${!searching && view === 'all' ? 'two-col' : ''}`}>
          {showUpcoming && (
            <TodoSection
              title="Upcoming"
              count={upcoming.length}
              overdueCount={searching ? undefined : overdueCount}
              emptyMessage={
                searching
                  ? 'No matching items.'
                  : overdueCount > 0
                    ? 'Nothing upcoming — deal with the overdue items in Past.'
                    : 'Nothing here yet — add a todo above!'
              }
            >
              {upcoming.map((todo) => (
                <TodoItem key={todo.id} todo={todo} {...itemProps} />
              ))}
            </TodoSection>
          )}

          {showPast && (
            <TodoSection
              title={searching ? 'Past & completed' : 'Past'}
              count={past.length}
              emptyMessage={searching ? 'No matching items.' : 'No past items yet.'}
              action={
                searching ? undefined : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={clearHistory}
                    disabled={past.length === 0}
                  >
                    Clear history
                  </button>
                )
              }
            >
              {past.map((todo) => (
                <TodoItem key={todo.id} todo={todo} {...itemProps} />
              ))}
            </TodoSection>
          )}
        </div>
      </main>

      <UndoToast undo={undo} onUndo={restoreTodos} />
    </div>
  )
}

export default App
