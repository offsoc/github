import {useReposAnalytics} from '../../../hooks/use-repos-analytics'
import type {RefComparison} from '@github-ui/code-view-types'
import {Spinner} from '@primer/react'

import {useBranchUpdater} from '../../../hooks/use-branch-updater'
import {useMergeabilityCheck} from '../../../hooks/use-mergeability-check'
import {FetchUpstreamPopoverContent} from './FetchUpstreamPopoverContent'
import {FetchUpstreamWithConflictsPopoverContent} from './FetchUpstreamWithConflictsPopoverContent'
import {syncForkButtonEventPayload} from './generate-button-event-payload'

interface Props {
  comparison: RefComparison
}

export function FetchPopoverContainer({comparison}: Props) {
  const [mergeabilityState, loading, error] = useMergeabilityCheck({
    base: comparison.currentRef,
    head: comparison.baseBranchRange,
  })
  const {sendRepoClickEvent} = useReposAnalytics()

  const {discardChanges, updateBranch} = useBranchUpdater()

  const discardAndReload = async () => {
    sendRepoClickEvent('SYNC_FORK.DISCARD', {...syncForkButtonEventPayload, action: 'Discard Conflicts'})
    const response = await discardChanges()
    if (response.ok && response.url) {
      window.location.href = response.url
    }
  }

  const updateAndReload = async () => {
    sendRepoClickEvent('SYNC_FORK.UPDATE', {...syncForkButtonEventPayload, action: 'Fetch and merge'})
    const response = await updateBranch()
    if (response.ok && response.url) {
      window.location.href = response.url
    }
  }

  if (comparison.behind === 0) {
    return <FetchUpstreamPopoverContent update={updateAndReload} discard={discardAndReload} comparison={comparison} />
  }

  // As of now we don't have a particular error handling, therefore we fall back to showing a spinner.
  // This will prevent from going into the corrupt data state.
  if (loading || error) {
    return (
      <div className="p-4 d-flex flex-justify-center">
        <Spinner />
      </div>
    )
  }

  if (mergeabilityState === 'clean') {
    return <FetchUpstreamPopoverContent update={updateAndReload} discard={discardAndReload} comparison={comparison} />
  }

  return <FetchUpstreamWithConflictsPopoverContent discard={discardAndReload} comparison={comparison} />
}
