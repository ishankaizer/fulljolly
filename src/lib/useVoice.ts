import { useCallback, useEffect, useRef, useState } from 'react'
import { play, stopAudio, type Clip } from './audio'

/** Plays clips and reports whether Pip should be talking. Stops talking when the screen closes. */
export function useVoice() {
  const [talking, setTalking] = useState(false)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      stopAudio()
    }
  }, [])

  const say = useCallback(async (...clips: Clip[]) => {
    setTalking(true)
    const finished = await play(...clips)
    if (alive.current && finished) setTalking(false)
    return finished && alive.current
  }, [])

  return { talking, say }
}
