import { useEffect, useRef } from 'react'

interface Props {
  query: string
  onChange: (value: string) => void
}

function SearchBar({ query, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Press '/' anywhere to jump into search (unless typing in another field).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement
        const typingElsewhere =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        if (!typingElsewhere) {
          e.preventDefault()
          inputRef.current?.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="search-bar">
      <span className="search-icon" aria-hidden="true">
        🔍
      </span>
      <input
        ref={inputRef}
        type="search"
        className="search-input"
        placeholder="Search todos…  ( / )"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onChange('')
            inputRef.current?.blur()
          }
        }}
        aria-label="Search todos"
      />
      {query && (
        <button
          type="button"
          className="search-clear"
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          aria-label="Clear search"
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default SearchBar
