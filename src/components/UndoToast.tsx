import type { UndoState } from '../hooks/useTodos'

interface Props {
  undo: UndoState | null
  onUndo: () => void
}

function UndoToast({ undo, onUndo }: Props) {
  if (!undo) return null
  return (
    <div className="undo-toast" role="status">
      <span>
        {undo.label} — {undo.removed.length} {undo.removed.length === 1 ? 'item' : 'items'}
      </span>
      <button type="button" className="btn btn-undo" onClick={onUndo}>
        Undo
      </button>
    </div>
  )
}

export default UndoToast
