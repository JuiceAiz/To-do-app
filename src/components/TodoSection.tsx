import type { ReactNode } from 'react'

interface Props {
  title: string
  count: number
  /** Number of overdue items, shown as a red chip next to the count. */
  overdueCount?: number
  /** Optional trailing action, e.g. "Clear history". */
  action?: ReactNode
  emptyMessage: string
  hidden?: boolean
  children: ReactNode
}

function TodoSection({ title, count, overdueCount, action, emptyMessage, hidden, children }: Props) {
  return (
    <section className="todo-section" hidden={hidden}>
      <div className="section-header">
        <h2 className="section-title">
          {title}
          <span className="count-badge">{count}</span>
          {overdueCount ? <span className="overdue-chip">{overdueCount} overdue</span> : null}
        </h2>
        {action}
      </div>
      {count === 0 ? (
        <p className="empty">{emptyMessage}</p>
      ) : (
        <ul className="todo-list">{children}</ul>
      )}
    </section>
  )
}

export default TodoSection
