import {createContext, createRef, type PropsWithChildren, type RefObject, useContext, useMemo, useRef} from 'react'

type ActionBarRefContextProps = {
  outerContainerRef: RefObject<HTMLDivElement>
  itemContainerRef: RefObject<HTMLDivElement>
  anchorRef?: RefObject<HTMLElement>
}

const ActionBarRefContext = createContext<ActionBarRefContextProps>({
  outerContainerRef: createRef(),
  itemContainerRef: createRef(),
})

export const ActionBarRefProvider = ({
  value: {anchorRef},
  children,
}: PropsWithChildren & {value: Pick<ActionBarRefContextProps, 'anchorRef'>}) => {
  const outerContainerRef = useRef<HTMLDivElement>(null)
  const itemContainerRef = useRef<HTMLDivElement>(null)
  const value = useMemo(() => ({outerContainerRef, itemContainerRef, anchorRef}), [anchorRef])
  return <ActionBarRefContext.Provider value={value}>{children}</ActionBarRefContext.Provider>
}

export const useActionBarRef = () => {
  const context = useContext(ActionBarRefContext)
  if (!context) throw new Error('useActionBarRef must be used with ActionBarRefProvider.')
  return context
}
