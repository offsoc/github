import {useEffect, useState} from 'react'

export function useMetaAndShiftKeys() {
  const [metaAndShiftKeysPressed, setMetaAndShiftKeysPressed] = useState(false)

  // keep track of when meta and shift keys are pressed
  useEffect(() => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    const handleKeyDown = (e: KeyboardEvent) => setMetaAndShiftKeysPressed((e.ctrlKey || e.metaKey) && e.shiftKey)
    const handleKeyUp = () => setMetaAndShiftKeysPressed(false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleKeyUp)
    }
  }, [])

  return {metaAndShiftKeysPressed}
}
