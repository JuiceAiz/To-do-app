import { useState } from 'react'
import type { FormEvent } from 'react'
import { todayKey } from '../dates'

interface Props {
  onAdd: (text: string, dueDate?: string) => void
}

function AddTodoForm({ onAdd }: Props) {
  const [text, setText] = useState('')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(text, dueDate || undefined)
    setText('')
    setDueDate('')
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="input"
        placeholder="What needs doing?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="New todo text"
        autoComplete="off"
      />
      <div className="date-wrap">
        <input
          type="date"
          className="input input-date"
          value={dueDate}
          min={todayKey()}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="Due date (optional)"
        />
        {dueDate && (
          <button
            type="button"
            className="date-clear"
            onClick={() => setDueDate('')}
            aria-label="Clear due date"
            title="Clear due date"
          >
            ✕
          </button>
        )}
      </div>
      <button type="submit" className="btn btn-primary" disabled={!text.trim()}>
        Add
      </button>
    </form>
  )
}

export default AddTodoForm
