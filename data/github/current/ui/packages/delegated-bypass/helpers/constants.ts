import type {FilterableRequestStatus} from '../delegated-bypass-types'

export const orderedStatuses: FilterableRequestStatus[] = ['all', 'completed', 'cancelled', 'expired', 'denied', 'open']
export const requestStatuses: Record<FilterableRequestStatus, string> = {
  all: 'All statuses',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
  denied: 'Denied',
  open: 'Open',
}

export const enum UpdateState {
  Initial = 'initial',
  Submitting = 'submitting',
  Success = 'success',
  Error = 'error',
}
