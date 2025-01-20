import {createContext, useContext, useEffect, useMemo, useState} from 'react'

type KeyPressType = {
  ctrlKey: boolean
}

const KeyPress = createContext<KeyPressType | null>(null)

/**
 * A context provider to track state at the component level
 * which we can use to render the drag sash with better precision than event handlers
 * attached to project subcomponents.
 *
 * This allows us to detect keyboard chords and store this information for
 * use further down the component tree.
 */
export const KeyPressProvider: React.FC<{children: React.ReactNode}> = props => {
  const [ctrlKey, setCtrlKey] = useState(false)

  useEffect(() => {
    const callback = (event: MouseEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      setCtrlKey(event.ctrlKey)
    }

    window.addEventListener('mousedown', callback)
    window.addEventListener('mousemove', callback)

    return () => {
      window.removeEventListener('mousedown', callback)
      window.removeEventListener('mousemove', callback)
    }
  })

  useEffect(() => {
    const callback = (event: KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      setCtrlKey(event.ctrlKey)
    }

    window.addEventListener('keydown', callback)
    window.addEventListener('keyup', callback)

    return () => {
      window.removeEventListener('keydown', callback)
      window.addEventListener('keyup', callback)
    }
  })

  const contextValue = useMemo(() => ({ctrlKey}), [ctrlKey])

  return <KeyPress.Provider value={contextValue}>{props.children}</KeyPress.Provider>
}

export const useKeyPress = (): KeyPressType => {
  const contextValue = useContext(KeyPress)
  if (!contextValue) {
    throw Error(`useKeyPress can only be accessed from a KeyPressProvider component`)
  }

  return contextValue
}
