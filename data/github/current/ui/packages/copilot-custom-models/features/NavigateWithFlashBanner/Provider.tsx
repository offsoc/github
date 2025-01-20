import {useNavigate} from '@github-ui/use-navigate'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react'
import noop from 'lodash-es/noop'
import {FlashPortal} from './FlashPortal'
import type {FlashState, To} from './types'

const defaultFlashState: FlashState = {
  message: '',
  variant: undefined,
}

interface IContext {
  navigate: (to: To, flashState?: FlashState) => void
  setFlashState: Dispatch<SetStateAction<FlashState>>
}

const Context = createContext<IContext>({
  navigate: noop,
  setFlashState: noop,
})

export function NavigateWithFlashBannerProvider({children}: PropsWithChildren) {
  const baseNavigate = useNavigate()
  const [flashState, setFlashState] = useState<FlashState>(defaultFlashState)

  const navigate = useCallback(
    (to: To, newFlashState: FlashState = defaultFlashState) => {
      baseNavigate(to)
      setFlashState(newFlashState)
    },
    [baseNavigate],
  )

  const value: IContext = useMemo(() => ({navigate, setFlashState}), [navigate])

  return (
    <Context.Provider value={value}>
      {!!flashState.message.length && <FlashPortal {...flashState} />}
      {children}
    </Context.Provider>
  )
}

export function useNavigateWithFlashBanner(): IContext {
  const context = useContext(Context)

  if (!context) {
    throw new Error('useFlashBanner must be used within <FlashBannerProvider />')
  }

  return context
}
