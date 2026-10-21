import { useEffect, useState } from 'react'

// Tiny hash router: #/ , #/vowel/a , #/lesson/a-at , #/grown-ups
// Hash routes work on any static host and keep the browser back button working.

const current = () => window.location.hash.replace(/^#/, '') || '/'

export function go(path: string) {
  window.location.hash = path
}

export function useRoute(): string[] {
  const [path, setPath] = useState(current)
  useEffect(() => {
    const onChange = () => setPath(current())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path.split('/').filter(Boolean)
}
