import {type PropsWithChildren, useCallback, useState} from 'react'
import {PullRequestLoader, type PullRequestLoaderProps} from './PullRequestLoader'
import {useTreeComparison} from './TreeComparisonContext'
import {
  type UseTreeComparisonWebsocketProps,
  useTreeComparisonWebsocket,
  type PullRequestWebsocketData,
  type BranchWebsocketData,
} from './use-tree-comparison-websocket'

export interface WebsocketLoaderProps extends Pick<UseTreeComparisonWebsocketProps, 'signedWebsocketChannel'> {}

export const WebsocketLoader = ({children, signedWebsocketChannel}: PropsWithChildren<WebsocketLoaderProps>) => {
  const [pullRequestId, setPullRequestId] = useState<PullRequestLoaderProps['pullRequestId'] | undefined>()
  const {treeComparison, setTreeComparison} = useTreeComparison()

  const handlePullRequestWebsocketEvent = useCallback((data: PullRequestWebsocketData) => {
    setPullRequestId(data.gid)
  }, [])

  const handleBranchWebsocketEvent = useCallback(
    (data: BranchWebsocketData) => {
      if (treeComparison && data.before === treeComparison.headRevision) {
        setTreeComparison({...treeComparison, headRevision: data.after})
      }
    },
    [setTreeComparison, treeComparison],
  )

  useTreeComparisonWebsocket({signedWebsocketChannel, handlePullRequestWebsocketEvent, handleBranchWebsocketEvent})

  if (pullRequestId !== undefined) {
    return <PullRequestLoader pullRequestId={pullRequestId}>{children}</PullRequestLoader>
  }

  return <>{children}</>
}
