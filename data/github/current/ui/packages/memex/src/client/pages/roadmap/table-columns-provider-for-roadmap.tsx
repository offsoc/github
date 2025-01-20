import {useCallback, useMemo} from 'react'

import {SystemColumnId} from '../../api/columns/contracts/memex-column'
import {TableColumnsProvider} from '../../components/react_table/state-providers/table-columns/table-columns-provider'
import {useUserSettings} from '../../components/user-settings'
import {isRoadmapColumnModel} from '../../helpers/roadmap-helpers'
import {useRoadmapSettings} from '../../hooks/use-roadmap-settings'
import type {ColumnModel} from '../../models/column-model'

export const TableColumnsProviderForRoadmap: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {roadmapShowDateFields} = useUserSettings()
  const {dateFields} = useRoadmapSettings()

  const dateFieldIds = useMemo(() => {
    return roadmapShowDateFields.enabled ? dateFields.filter(isRoadmapColumnModel).map(field => field.id) : []
  }, [roadmapShowDateFields, dateFields])

  const isFieldVisible = useCallback(
    (column: ColumnModel) => {
      if (column.id === SystemColumnId.Title) return true

      return dateFieldIds.includes(column.id)
    },
    [dateFieldIds],
  )

  return <TableColumnsProvider isFieldVisible={isFieldVisible}>{children}</TableColumnsProvider>
}
