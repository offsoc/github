import {useCallback, useMemo} from 'react'

import type {LayoutSettings, TableLayoutSettings} from '../api/view/contracts'

export function useDefaultLayoutSettingsForTable() {
  const getTableSettingsOrDefaults = useCallback((layoutSettings: LayoutSettings): TableLayoutSettings => {
    return {
      columnWidths: layoutSettings.table?.columnWidths ?? {},
    }
  }, [])

  return useMemo(
    () => ({
      getTableSettingsOrDefaults,
    }),
    [getTableSettingsOrDefaults],
  )
}
