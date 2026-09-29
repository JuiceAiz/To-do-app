import { computeAnalytics } from '../analytics'
import type { Todo } from '../types'

interface Props {
  todos: Todo[]
}

function AnalyticsPanel({ todos }: Props) {
  const a = computeAnalytics(todos)
  const max = Math.max(...a.days.map((d) => d.count), 1)

  const kpis = [
    { label: 'Done today', value: a.doneToday },
    { label: 'This week', value: a.doneThisWeek },
    { label: 'Current streak', value: a.currentStreak, suffix: a.currentStreak === 1 ? 'day' : 'days' },
    { label: 'Longest streak', value: a.longestStreak, suffix: a.longestStreak === 1 ? 'day' : 'days' },
  ]

  return (
    <section className="analytics" aria-label="Productivity analytics">
      <div className="kpi-row">
        {kpis.map((k) => (
          <div className="kpi-card" key={k.label}>
            <span className="kpi-value">
              {k.value}
              {k.suffix ? <span className="kpi-suffix"> {k.suffix}</span> : null}
            </span>
            <span className="kpi-label">{k.label}</span>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Completions · last 7 days</h3>
          <span className="chart-total">{a.doneThisWeek} total</span>
        </div>
        <div className="chart" role="img" aria-label={`Bar chart of completions for the last 7 days, ${a.doneThisWeek} total`}>
          {a.days.map((d) => (
            <div className="chart-col" key={d.key}>
              <span className="chart-count">{d.count > 0 ? d.count : ''}</span>
              <div className="chart-track">
                <div
                  className={`chart-bar ${d.key === a.days[a.days.length - 1].key ? 'today' : ''}`}
                  style={{ height: `${(d.count / max) * 100}%` }}
                />
              </div>
              <span className="chart-label">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AnalyticsPanel
