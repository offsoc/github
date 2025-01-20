import {useCallback, useMemo} from 'react'

import {makeFieldsByFilterableName, normalizeToFilterName} from '../components/filter-bar/helpers/search-filter'
import type {ColumnModel} from '../models/column-model'
import {useAllColumns} from '../state-providers/columns/use-all-columns'

export function useFindFilterableFieldByName() {
  const {allColumns} = useAllColumns()
  const allFieldsByFilterableName = useMemo(() => {
    return makeFieldsByFilterableName(allColumns)
  }, [allColumns])

  const findFilterableFieldByName = useCallback(
    (fieldName: string): ColumnModel | undefined => {
      return allFieldsByFilterableName.get(normalizeToFilterName(fieldName))
    },
    [allFieldsByFilterableName],
  )

  return {findFilterableFieldByName}
}
