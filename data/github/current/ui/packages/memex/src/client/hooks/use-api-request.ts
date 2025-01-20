import {type MutableRefObject, useCallback, useMemo, useRef} from 'react'

import useToasts, {ToastType} from '../components/toasts/use-toasts'
import {ApiError} from '../platform/api-error'
/**
 * This hook makes resilient communication with the API a bit easier by automatically displaying a
 * toast error and rolling back application state in response to API errors.
 *
 * This interface describes the object that can be used to configure the hook's behaviour.
 */
interface UseApiRequestProps<TRequestArgs = void, TRollbackArgs = void, TResponse = void> {
  /**
   * Async function that makes a network request to the API.
   */
  request: (args: TRequestArgs) => Promise<TResponse>

  /**
   * Function that will be used to reset application state if `perform` fails.
   */
  rollback?: (args: TRollbackArgs) => void

  /**
   * Whether or not we should display a toast with the error message from the
   * API. Defaults to true.
   */
  showErrorToast?: boolean
}

export interface UseApiRequest<TRequestArgs = void, TRollbackArgs = void, TResponse = void> {
  /**
   * Perform the request.
   */
  perform: (requestArgs: TRequestArgs, rollbackArgs: TRollbackArgs) => Promise<void>

  /**
   * A ref pointing to the latest request status.
   */
  status: MutableRefObject<Status<TResponse>>
}

/** The initial status of the API request (before we've even made a network request) */
type StatusIdle = {status: 'idle'; data: undefined}

/** The status of the API request once the network request is in flight */
type StatusLoading = {status: 'loading'; data: undefined}

/** The status of the API request when the API has returned a response outside the HTTP 200 range */
type StatusFailed = {status: 'failed'; data: undefined}

/** The status of the API request when the API has returned a response in the HTTP 200 range. */
type StatusSucceeded<TResponse> = {status: 'succeeded'; data: TResponse}

/** Represents the set of possible statuses for this API requests. */
export type Status<TResponse = void> = StatusIdle | StatusLoading | StatusFailed | StatusSucceeded<TResponse>

export const useApiRequest = <TRequestArgs = void, TRollbackArgs = void, TResponse = void>({
  request,
  rollback,
  showErrorToast = true,
}: UseApiRequestProps<TRequestArgs, TRollbackArgs, TResponse>): UseApiRequest<
  TRequestArgs,
  TRollbackArgs,
  TResponse
> => {
  const status = useRef<Status<TResponse>>({status: 'idle', data: undefined})
  const {addToast} = useToasts()

  const perform = useCallback(
    async (requestArgs: TRequestArgs, rollbackArgs: TRollbackArgs) => {
      try {
        status.current.status = 'loading'
        const data = await request(requestArgs)
        status.current.data = data
        status.current.status = 'succeeded'
      } catch (error) {
        if (error instanceof ApiError) {
          status.current.status = 'failed'

          if (rollback) {
            rollback(rollbackArgs)
          }

          if (showErrorToast) {
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({message: error.message, type: ToastType.error})
          }

          return
        }

        throw error
      }
    },
    [addToast, request, rollback, showErrorToast],
  )

  return useMemo(() => ({perform, status}), [perform, status])
}
