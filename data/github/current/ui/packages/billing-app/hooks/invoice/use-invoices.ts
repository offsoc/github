import {useEffect, useState} from 'react'
import type {Invoice} from '../../types/invoices'
import {getInvoicesRequest} from '../../services/invoices'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ERRORS} from '../../constants'
import {RequestState} from '../../enums'

type UseInvoicesParams = {
  enterpriseSlug: string
  customerId: string // can be cost center uuid or enterprise customer id
}
function useInvoices({enterpriseSlug, customerId}: UseInvoicesParams) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [requestState, setRequestState] = useState<RequestState>(RequestState.INIT)
  const {addToast} = useToastContext()

  useEffect(() => {
    const getInvoices = async () => {
      if (!enterpriseSlug || !customerId) return

      try {
        const response = await getInvoicesRequest(enterpriseSlug, customerId)
        if (response.statusCode === 200) {
          setInvoices(response.invoices)
          setRequestState(RequestState.IDLE)
        } else {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.QUERY_INVOICES_ERROR,
          })
          setRequestState(RequestState.ERROR)
        }
      } catch {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: ERRORS.QUERY_INVOICES_ERROR,
        })
        setRequestState(RequestState.ERROR)
      }
    }
    setInvoices([])
    getInvoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterpriseSlug, customerId])

  return {invoices, requestState}
}

export default useInvoices
