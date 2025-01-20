import {useEffect, useState} from 'react'
import type {AzureEmission, EmissionDate} from '../../types/azure-emissions'
import {getAzureEmissionsRequest} from '../../services/azure_emissions'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ERRORS} from '../../constants'
import {RequestState} from '../../enums'

type UseAzureEmissionParams = {
  enterpriseSlug: string
  emissionDate: EmissionDate
}
function useAzureEmissions({enterpriseSlug, emissionDate}: UseAzureEmissionParams) {
  const [azureEmissions, setAzureEmissions] = useState<AzureEmission[]>([])
  const [requestState, setRequestState] = useState<RequestState>(RequestState.INIT)
  const {addToast} = useToastContext()

  useEffect(() => {
    const getAzureEmissions = async () => {
      if (!enterpriseSlug || !emissionDate) return
      setRequestState(RequestState.LOADING)
      try {
        const response = await getAzureEmissionsRequest(enterpriseSlug, emissionDate)
        if (response.statusCode === 200) {
          setAzureEmissions(response.azureEmissions)
          setRequestState(RequestState.IDLE)
        } else {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.QUERY_AZURE_EMISSIONS_ERROR,
          })
          setRequestState(RequestState.ERROR)
        }
      } catch {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: ERRORS.QUERY_AZURE_EMISSIONS_ERROR,
        })
        setRequestState(RequestState.ERROR)
      }
    }
    setAzureEmissions([])
    getAzureEmissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterpriseSlug, emissionDate])

  return {azureEmissions, requestState}
}

export default useAzureEmissions
