import { useCallback, useEffect, useRef, useState } from 'react'
import type { Todo } from '../types'
import { todayKey } from '../dates'

const STORAGE_KEY = 'todo-app.todos'

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (t): t is Todo =>
        t != null &&
        typeof t === 'object' &&
        typeof t.id === 'string' &&
        typeof t.text === 'string' &&
        typeof t.done === 'boolean' &&
        typeof t.createdAt === 'number',
    )
  } catch {
    return []
  }
}

/** Overdue = open todo whose due date is before today. */
export function isPastDue(t: Todo): boolean {
  return !t.done && t.dueDate !== undefined && t.dueDate < todayKey()
}

export interface UndoState {
  /** The todos that were removed, so they can be restored verbatim. */
  removed: Todo[]
  /** Description of what was removed, e.g. "1 todo" or "history cleared". */
  label: string
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [undo, setUndo] = useState<UndoState | null>(null)
  const undoTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // Storage may be unavailable (private mode); the app still works in memory.
    }
  }, [todos])

  const clearUndoTimer = useCallback(() => {
    if (undoTimer.current !== undefined) {
      window.clearTimeout(undoTimer.current)
      undoTimer.current = undefined
    }
  }, [])

  /** Show an undo toast for the given removed todos; auto-dismisses after 6s. */
  const showUndo = useCallback(
    (removed: Todo[], label: string) => {
      clearUndoTimer()
      setUndo({ removed, label })
      undoTimer.current = window.setTimeout(() => setUndo(null), 6000)
    },
    [clearUndoTimer],
  )

  const addTodo = useCallback((text: string, dueDate?: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const todo: Todo = {
      id: createId(),
      text: trimmed,
      done: false,
      createdAt: Date.now(),
      ...(dueDate ? { dueDate } : {}),
    }
    setTodos((prev) => [todo, ...prev])
  }, [])

  const editTodo = useCallback((id: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t)))
  }, [])

  const setDueDate = useCallback((id: string, dueDate: string | undefined) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...(dueDate ? { dueDate } : { dueDate: undefined }) } : t,
      ),
    )
  }, [])

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : undefined }
          : t,
      ),
    )
  }, [])

  const deleteTodo = useCallback(
    (id: string) => {
      const removed = todos.find((t) => t.id === id)
      if (!removed) return
      setTodos((prev) => prev.filter((t) => t.id !== id))
      showUndo([removed], 'todo deleted')
    },
    [todos, showUndo],
  )

  const restoreTodos = useCallback(() => {
    if (!undo) return
    const restoredIds = new Set(undo.removed.map((t) => t.id))
    setTodos((prev) => [...prev.filter((t) => !restoredIds.has(t.id)), ...undo.removed])
    clearUndoTimer()
    setUndo(null)
  }, [undo, clearUndoTimer])

  const clearHistory = useCallback(() => {
    const past = todos.filter((t) => t.done || isPastDue(t))
    if (past.length === 0) return
    const pastIds = new Set(past.map((t) => t.id))
    setTodos((prev) => prev.filter((t) => !pastIds.has(t.id)))
    showUndo(past, 'history cleared')
  }, [todos, showUndo])

  // Clean up the timer on unmount.
  useEffect(() => clearUndoTimer, [clearUndoTimer])

  return {
    todos,
    addTodo,
    editTodo,
    setDueDate,
    toggleTodo,
    deleteTodo,
    restoreTodos,
    clearHistory,
    undo,
  }
}
