import {useState} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

import type {CostCenter} from '../../types/cost-centers'
import useRequest from '../use-request'
import {COST_CENTERS_ROUTE} from '../../routes'

// type UseCostCentersPageProps = {}

function useCostCentersPage() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const {addToast} = useToastContext()

  useRequest({
    route: COST_CENTERS_ROUTE,
    onStart: () => setCostCenters([]),
    onSuccess: response => setCostCenters(response.data.payload.activeCostCenters),
    onError: () =>
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({type: 'error', message: 'Unable to query cost centers'}),
  })
  return {costCenters}
}

export default useCostCentersPage
