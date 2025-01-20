import {useCallback} from 'react'
import {useAlive} from '@github-ui/use-alive'
import {useSearchParams} from 'react-router-dom'

type LiveBranchesProps = {
  channel?: string
  onUpdate: (data: unknown) => void
}
type AliveResponse = {
  reason: string
}

export function LiveBranches({channel = '', onUpdate}: LiveBranchesProps) {
  const [, setSearchParams] = useSearchParams()
  const aliveCallback = useCallback(
    (args: AliveResponse) => {
      onUpdate(args)
      setSearchParams(params => {
        params.set('branch_event', encodeURIComponent(args.reason))
        return params
      })
    },
    [onUpdate, setSearchParams],
  )

  useAlive(channel, aliveCallback)
  return null
}
