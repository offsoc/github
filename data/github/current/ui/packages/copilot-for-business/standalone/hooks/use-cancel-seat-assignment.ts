import {useCreateMutator} from '../../hooks/use-fetchers'
import {useState, useCallback} from 'react'
import {standaloneSeatManagementEndpoint} from '../helpers/api-endpoints'

type Configs<Response> = {
  owner: string
  onError?: () => void
  onComplete?: (data: Response) => void
}

export function useCancelSeatAssignment<Response>(configs: Configs<Response>) {
  const {owner, onError, onComplete} = configs
  const [pendingConfirmation, setPendingConfirmation] = useState(false)
  const [cancellationError, setCancellationError] = useState('')
  const useRemoteMutation = useCreateMutator(standaloneSeatManagementEndpoint, {slug: owner})
  const [handler] = useRemoteMutation<string, Response>({
    resource: 'seat_management',
    method: 'DELETE',
  })
  const rejectConfirmation = useCallback(() => {
    setPendingConfirmation(false)
    setCancellationError('')
  }, [])

  const beginCancel = useCallback(() => {
    setPendingConfirmation(true)
  }, [])

  const confirmCancellation = useCallback(
    (data: string) => {
      handler({
        payload: data,
        onError: () => {
          setCancellationError('Something went wrong. Please try again later.')
          onError?.()
        },
        onComplete: respData => {
          setPendingConfirmation(false)
          setCancellationError('')
          respData && onComplete?.(respData)
        },
      })
    },
    [handler, onComplete, onError],
  )

  return {
    confirmCancellation,
    rejectConfirmation,
    beginCancel,
    cancellationError,
    pendingConfirmation,
  }
}
