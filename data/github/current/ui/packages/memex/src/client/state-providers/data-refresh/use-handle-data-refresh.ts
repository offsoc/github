import {useCallback} from 'react'

import {apiGetAllMemexData, cancelGetAllMemexData} from '../../api/memex/api-get-all-memex-data'
import type {GetAllMemexDataRequest} from '../../api/memex/contracts'
import {useApiRequest} from '../../hooks/use-api-request'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useViews} from '../../hooks/use-views'
import {useCharts} from '../charts/use-charts'
import {useFindLoadedFieldIds} from '../columns/use-find-loaded-field-ids'
import {useUpdateColumns} from '../columns/use-update-columns'
import {useCreatedWithTemplateMemex} from '../created-with-template-memex/created-with-template-memex-provider'
import {useSetProject} from '../memex/use-set-project'
import {useUpdateMemexItems} from '../memex-items/use-update-memex-items'
import {useUpdateMemexService} from '../memex-service/use-update-memex-service'
import {useWorkflows} from '../workflows/use-workflows'

export const useHandleDataRefresh = () => {
  const {setAllWorkflows} = useWorkflows()
  const {setProject} = useSetProject()
  const {updateMemexItems} = useUpdateMemexItems()
  const {findLoadedFieldIds} = useFindLoadedFieldIds()
  const {updateColumns} = useUpdateColumns()
  const {updateViewServerStates} = useViews()
  const {updateChartConfigurations} = useCharts()
  const {setCreatedWithTemplateMemex} = useCreatedWithTemplateMemex()
  const {updateMemexService} = useUpdateMemexService()
  const {memex_table_without_limits} = useEnabledFeatures()

  const {perform: performRefreshRequest, status: refreshRequestStatus} = useApiRequest({
    request: useCallback((request: GetAllMemexDataRequest) => {
      cancelGetAllMemexData()
      const req = apiGetAllMemexData(request)

      return req
    }, []),
    showErrorToast: false,
  })

  const handleUpdateData = useCallback(async () => {
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
        memexService,
      } = refreshRequestStatus.current.data

      /**
       * Avoid wrapping in a transition, since this will force a url update
       * that could potentially clash with the timing of a transition
       */
      updateMemexService(memexService)
      setProject(memexProject)
      if (!memex_table_without_limits) {
        updateMemexItems(memexProjectItems)
      }
      updateColumns(memexProjectAllColumns)
      updateViewServerStates(memexViews)
      setAllWorkflows(memexWorkflowConfigurations, memexWorkflows)
      updateChartConfigurations(memexCharts)
      setCreatedWithTemplateMemex(createdWithTemplateMemex)
    }
  }, [
    findLoadedFieldIds,
    memex_table_without_limits,
    performRefreshRequest,
    refreshRequestStatus,
    setAllWorkflows,
    setProject,
    updateChartConfigurations,
    updateColumns,
    updateMemexItems,
    updateMemexService,
    updateViewServerStates,
    setCreatedWithTemplateMemex,
  ])

  return handleUpdateData
}
