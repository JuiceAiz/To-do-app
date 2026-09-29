# Todo

A black-branded todo list app built with React + Vite + TypeScript.

## Features

- **Add** — type a todo, optionally attach a due date (past dates can't be picked)
- **Sections** — *Upcoming* (open items, dated first) and *Past* (completed + overdue, most recent first)
- **Overdue awareness** — red chips on late items, per-section overdue counts, "today" highlighting
- **Edit in place** — click any todo's text (or ✎) to rename it; Enter saves, Esc cancels
- **Delete with undo** — ✕ removes with a 6-second undo toast; **Clear history** wipes the Past section (also undoable)
- **Light / dark mode** — toggle in the header; defaults to your system preference and persists
- **Offline persistence** — everything is stored in `localStorage`

## Develop

```bash
npm install
npm run dev      # start dev server
npm run build    # typecheck + production build
npm run lint     # oxlint
```
