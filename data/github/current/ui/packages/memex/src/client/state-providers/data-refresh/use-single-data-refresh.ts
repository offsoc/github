import {useCallback} from 'react'

import {apiGetSingleMemexRefresh} from '../../api/memex/api-get-all-memex-data'
import type {GetAllMemexDataRequest} from '../../api/memex/contracts'
import {useApiRequest} from '../../hooks/use-api-request'
import {useViews} from '../../hooks/use-views'
import {useCharts} from '../charts/use-charts'
import {useFindLoadedFieldIds} from '../columns/use-find-loaded-field-ids'
import {useUpdateColumns} from '../columns/use-update-columns'
import {useCreatedWithTemplateMemex} from '../created-with-template-memex/created-with-template-memex-provider'
import {useSetProject} from '../memex/use-set-project'
import {useUpdateMemexItems} from '../memex-items/use-update-memex-items'
import {useWorkflows} from '../workflows/use-workflows'

/**
 * This is a copy of the useHandleDataRefresh hook without the queue.
 * don't use this call unless you have to wait for a specific refresh request to finish.
 */
export function useSingleDataRefresh() {
  const {setAllWorkflows} = useWorkflows()
  const {setProject} = useSetProject()
  const {updateMemexItems} = useUpdateMemexItems()
  const {findLoadedFieldIds} = useFindLoadedFieldIds()
  const {updateColumns} = useUpdateColumns()
  const {updateViewServerStates} = useViews()
  const {updateChartConfigurations} = useCharts()
  const {setCreatedWithTemplateMemex} = useCreatedWithTemplateMemex()

  const {perform: performRefreshRequest, status: refreshRequestStatus} = useApiRequest({
    request: useCallback((request: GetAllMemexDataRequest) => {
      const req = apiGetSingleMemexRefresh(request)

      return req
    }, []),
    showErrorToast: false,
  })

  const handleSingleMemexUpdate = useCallback(async () => {
    await performRefreshRequest({visibleFields: [...findLoadedFieldIds()]})

    if (refreshRequestStatus.current.status === 'succeeded') {
      const {
        memexProject,
        memexProjectItems,
        memexProjectAllColumns,
        memexViews,
        memexWorkflows,
        memexWorkflowConfigurations,
        memexCharts,
        createdWithTemplateMemex,
      } = refreshRequestStatus.current.data

      setProject(memexProject)
      updateMemexItems(memexProjectItems)
      updateColumns(memexProjectAllColumns)
      updateViewServerStates(memexViews)
      setAllWorkflows(memexWorkflowConfigurations, memexWorkflows)
      updateChartConfigurations(memexCharts)
      setCreatedWithTemplateMemex(createdWithTemplateMemex)
    }
  }, [
    findLoadedFieldIds,
    performRefreshRequest,
    refreshRequestStatus,
    setAllWorkflows,
    setProject,
    updateChartConfigurations,
    updateColumns,
    updateMemexItems,
    updateViewServerStates,
    setCreatedWithTemplateMemex,
  ])

  return handleSingleMemexUpdate
}
