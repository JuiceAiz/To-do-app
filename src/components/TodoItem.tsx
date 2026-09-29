import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Todo } from '../types'
import { daysFromToday, todayKey } from '../dates'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
}

function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) editInputRef.current?.select()
  }, [editing])

  const startEdit = () => {
    setDraft(todo.text)
    setEditing(true)
  }

  const commitEdit = () => {
    if (draft.trim() && draft.trim() !== todo.text) onEdit(todo.id, draft)
    setEditing(false)
  }

  const handleEditKeys = (e: KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  const isOverdue = !todo.done && todo.dueDate !== undefined && todo.dueDate < todayKey()
  const isToday = !todo.done && todo.dueDate === todayKey()
  const diff = todo.dueDate ? daysFromToday(todo.dueDate) : 0

  const dateLabel = () => {
    if (!todo.dueDate) return null
    if (isOverdue) return `Overdue · ${formatDate(todo.dueDate)}`
    if (isToday) return 'Today'
    if (diff === 1) return 'Tomorrow'
    if (diff > 1) return formatDate(todo.dueDate)
    return formatDate(todo.dueDate) // past, completed
  }

  const chipClass = isOverdue ? 'date-chip overdue' : isToday ? 'date-chip today' : 'date-chip'

  return (
    <li className={`todo-item ${todo.done ? 'done' : ''}`}>
      <input
        type="checkbox"
        className="todo-check"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        aria-label={todo.done ? `Mark "${todo.text}" as not done` : `Complete "${todo.text}"`}
      />

      <div className="todo-body">
        {editing ? (
          <input
            ref={editInputRef}
            type="text"
            className="input edit-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleEditKeys}
            aria-label="Edit todo text"
          />
        ) : (
          <button
            type="button"
            className="todo-text"
            onClick={startEdit}
            title="Click to edit"
          >
            {todo.text}
          </button>
        )}

        {todo.dueDate && (
          <span className={chipClass}>{dateLabel()}</span>
        )}
      </div>

      <div className="todo-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={startEdit}
          aria-label={`Edit "${todo.text}"`}
          title="Edit"
        >
          ✎
        </button>
        <button
          type="button"
          className="icon-btn icon-btn-danger"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete "${todo.text}"`}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </li>
  )
}

function formatDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (y !== new Date().getFullYear()) opts.year = 'numeric'
  return new Date(y, m - 1, d).toLocaleDateString(undefined, opts)
}

export default TodoItem
