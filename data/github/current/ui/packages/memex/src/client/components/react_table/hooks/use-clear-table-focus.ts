import {useCallback} from 'react'

import {clearFocus, useStableTableNavigation} from '../navigation'

export function useClearTableFocus() {
  const {navigationDispatch} = useStableTableNavigation()
  return useCallback(() => {
    navigationDispatch(clearFocus())
  }, [navigationDispatch])
}
