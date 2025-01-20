import isEqual from 'lodash-es/isEqual'
import {useCallback, useMemo, useState} from 'react'

import type {SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {useGetFieldIdsFromFilter} from '../../../hooks/use-load-required-fields'

type FieldId = number | SystemColumnId

type UseLazyLoadFieldsOptions = {
  initialFields?: Array<FieldId>
}

export type UseLazyLoadFields = {
  requiredFields: Array<FieldId>
  loadedFields: Array<FieldId>
  addRequiredFieldsFromFilter: (filter: string) => void
  markFieldsAsLoaded: (fieldId: Array<FieldId>) => void
  hasAllFieldsLoaded: boolean
}

export function useLazyLoadFields({initialFields}: UseLazyLoadFieldsOptions): UseLazyLoadFields {
  const [requiredFields, setRequiredFields] = useState<ReadonlySet<FieldId>>(new Set(initialFields))
  const [loadedFields, setLoadedFields] = useState<ReadonlySet<FieldId>>(new Set())
  const {getFieldIdsFromFilter} = useGetFieldIdsFromFilter()

  const addRequiredFieldsFromFilter = useCallback(
    (filter: string) => {
      const ids = Array.from(getFieldIdsFromFilter(filter))
      const newFields = ids.filter(id => !requiredFields.has(id))

      // Only fetch fields whenever there are new ones that are required
      if (newFields.length > 0) {
        setRequiredFields(s => new Set([...Array.from(s), ...newFields]))
      }
    },
    [getFieldIdsFromFilter, requiredFields],
  )

  const markFieldsAsLoaded = useCallback((fieldId: Array<FieldId>) => {
    setLoadedFields(s => new Set([...Array.from(s), ...fieldId]))
  }, [])

  const hasAllFieldsLoaded = useMemo(() => isEqual(requiredFields, loadedFields), [requiredFields, loadedFields])

  const loadedList = useMemo(() => Array.from(loadedFields), [loadedFields])
  const requiredList = useMemo(() => Array.from(requiredFields), [requiredFields])

  return useMemo(
    () => ({
      loadedFields: loadedList,
      requiredFields: requiredList,
      addRequiredFieldsFromFilter,
      markFieldsAsLoaded,
      hasAllFieldsLoaded,
    }),
    [addRequiredFieldsFromFilter, hasAllFieldsLoaded, loadedList, markFieldsAsLoaded, requiredList],
  )
}
