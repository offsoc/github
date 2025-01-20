import {useCreateMutator} from '../../hooks/use-fetchers'
import {standaloneSeatManagementEndpoint} from '../helpers/api-endpoints'
import type {EnterpriseTeamAssignable} from '../types'
import {useCallback, useState} from 'react'

type Configs<Response> = {
  owner: string
  onError?: () => void
  onComplete?: (data: Response) => void
}

export function useCreateSeatAssignment<Response>({owner, onComplete, onError}: Configs<Response>) {
  const [error, setError] = useState('')

  const useRemoteMutation = useCreateMutator(standaloneSeatManagementEndpoint, {slug: owner})
  const [handler] = useRemoteMutation<{enterprise_team_ids: number[]}, Response>({
    resource: 'seat_management',
    method: 'POST',
  })

  const createAssignment = useCallback(
    (assignments: EnterpriseTeamAssignable | EnterpriseTeamAssignable[]) => {
      const ids = Array.isArray(assignments) ? assignments.map(a => a.id) : [assignments.id]
      handler({
        payload: {enterprise_team_ids: ids},
        onComplete: data => {
          setError('')
          data && onComplete?.(data)
        },
        onError: () => {
          setError('Something went wrong. Please try again later.')
          onError?.()
        },
      })
    },
    [handler, onComplete, onError],
  )

  return {createAssignment, error}
}
