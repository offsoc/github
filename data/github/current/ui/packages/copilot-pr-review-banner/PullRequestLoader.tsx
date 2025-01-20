import {type PropsWithChildren, useEffect} from 'react'
import {useTreeComparison} from './TreeComparisonContext'
import {useLoadTreeComparison} from './use-load-tree-comparison'

export interface PullRequestLoaderProps extends PropsWithChildren {
  pullRequestId: string
}

export const PullRequestLoader = ({children, pullRequestId}: PullRequestLoaderProps) => {
  const {setTreeComparison} = useTreeComparison()
  const treeComparison = useLoadTreeComparison(pullRequestId)

  useEffect(() => {
    if (treeComparison) setTreeComparison(treeComparison)
  }, [treeComparison, setTreeComparison])

  return <>{children}</>
}
