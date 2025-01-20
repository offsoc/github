import {useEffect, useRef} from 'react'

export function useShiftKey() {
  const shiftKeyPressedRef = useRef(false)

  // keep track of when the shift key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (shiftKeyPressedRef.current = e.shiftKey)
    const handleKeyUp = () => (shiftKeyPressedRef.current = false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return {shiftKeyPressedRef}
}
