import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'

export type FlashType =
  | 'definition.created.success'
  | 'definition.updated.success'
  | 'definition.deleted.success'
  | 'repos.properties.updated'

interface FlashContextState {
  flash: FlashType | null
}
const FlashContext = createContext<FlashContextState>({} as FlashContextState)
const SetFlashContext = createContext<(flash: FlashType | null) => void>(() => undefined)

export const BANNER_HIDE_DELAY_MS = 5 * 1_000

export function FlashProvider({children}: React.PropsWithChildren) {
  const timestampRef = useRef(0)
  const [flash, setFlash] = useState<FlashType | null>(null)

  const state = useMemo<FlashContextState>(() => ({flash}), [flash])
  const setter = useCallback((type: FlashType | null) => {
    setFlash(type)
    timestampRef.current = Date.now()
  }, [])

  useEffect(() => {
    const hideExpiredBanners = () => {
      if (Date.now() - timestampRef.current > BANNER_HIDE_DELAY_MS) {
        setFlash(null)
      }
    }
    document.addEventListener('soft-nav:start', hideExpiredBanners)
    return () => document.removeEventListener('soft-nav:start', hideExpiredBanners)
  })

  return (
    <FlashContext.Provider value={state}>
      <SetFlashContext.Provider value={setter}>{children}</SetFlashContext.Provider>
    </FlashContext.Provider>
  )
}

export function useSetFlash() {
  const setter = useContext(SetFlashContext)
  if (!setter) {
    throw new Error('useSetFlash must be used within FlashProvider')
  }

  return setter
}

function useFlashContext() {
  const context = useContext(FlashContext)

  if (!context) {
    throw new Error('useFlashContext must be used within FlashProvider')
  }

  return context
}

export function useActiveFlash(): FlashType | null {
  const {flash} = useFlashContext()

  return flash
}
