import { useState } from 'react'
import { go } from '../lib/router'
import { describe } from '../lib/routes'
import { linkTo, lockTeacher, whatsappLink } from '../lib/teacher'
import { Icon } from './ui'

/** A thin strip across the top while teacher mode is open: back to the desk, share this page, lock. */
export function TeacherBar({ route }: { route: string }) {
  const [copied, setCopied] = useState(false)
  const clean = route.replace(/^\//, '')
  const onDesk = ['teacher', 'studio', 'plan', 'grown-ups'].includes(clean.split('/')[0])
  const shareable = clean !== '' && !onDesk

  const share = () => {
    const url = linkTo(clean)
    const text = `${describe(clean)}\n${url}`
    window.open(whatsappLink(text), '_blank', 'noopener')
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(linkTo(clean))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copy this link', linkTo(clean))
    }
  }

  return (
    <div className="teacher-bar" role="region" aria-label="Teacher mode">
      <span className="teacher-badge">{Icon.unlock} Teacher mode</span>
      <span className="teacher-actions">
        {!onDesk && (
          <button type="button" onClick={() => go('/teacher')}>
            {Icon.gear} Desk
          </button>
        )}
        {shareable && (
          <>
            <button type="button" onClick={share}>
              {Icon.share} Send page
            </button>
            <button type="button" onClick={copy}>
              {copied ? Icon.check : Icon.link} {copied ? 'Copied' : 'Copy link'}
            </button>
          </>
        )}
        <button type="button" onClick={() => { lockTeacher(); go('/') }}>
          {Icon.lock} Lock
        </button>
      </span>
    </div>
  )
}
