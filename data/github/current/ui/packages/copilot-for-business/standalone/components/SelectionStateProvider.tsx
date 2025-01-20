import type React from 'react'
import {SelectionStateContext, type StableRef} from '../hooks/use-selection-state-context'
import {useSelectables, type SelectableProps} from '../hooks/use-selectables'
import {useMemo, useState} from 'react'

type Props<T> = React.PropsWithChildren<{
  selectionState: SelectableProps<T>
}>

export function SelectionStateProvider<T>(props: Props<T>) {
  const selectionState = useSelectables<T>(props.selectionState)
  const [stableRef, updateStableRef] = useState<StableRef<T>>({} as StableRef<T>)

  const contextValue = useMemo(() => {
    return {selectionState, stableRef, updateStableRef}
  }, [selectionState, stableRef, updateStableRef])

  return <SelectionStateContext.Provider value={contextValue}>{props.children}</SelectionStateContext.Provider>
}
