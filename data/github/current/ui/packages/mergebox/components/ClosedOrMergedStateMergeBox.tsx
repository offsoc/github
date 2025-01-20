import {branchPath} from '@github-ui/paths'
import useSafeState from '@github-ui/use-safe-state'
import {SyncIcon} from '@primer/octicons-react'
import {BranchName, Button, Spinner} from '@primer/react'
import {useRelayEnvironment} from 'react-relay'

import {deletePullRequestHeadRefMutation} from '../mutations/delete-pull-request-head-ref-mutation'
import {restorePullRequestHeadRefMutation} from '../mutations/restore-pull-request-head-ref'
import type {deletePullRequestHeadRefMutation$data} from '../mutations/__generated__/deletePullRequestHeadRefMutation.graphql'
import type {restorePullRequestHeadRefMutation$data} from '../mutations/__generated__/restorePullRequestHeadRefMutation.graphql'
import {MergeBoxSectionHeader} from './sections/common/MergeBoxSectionHeader'
import {borderColorClassForStatus, Status} from '../helpers/mergeability-status'
import type {PullRequestState} from '../types'

interface Props {
  // We only care about the closed and merged state
  state: PullRequestState

  // All of this needed only to create the branch path.
  headRefName: string
  headRepository:
    | {
        owner: {
          login: string
        }
        name: string
      }
    | null
    | undefined

  // These states are mutually exclusive
  viewerCanDeleteHeadRef: boolean
  viewerCanRestoreHeadRef: boolean
}

type RelayMutationCallbacks<T> = {
  onCompleted: (response: T) => void
  onError: (error: Error) => void
}

interface Callbacks {
  onDeleteHeadRef: ({onCompleted, onError}: RelayMutationCallbacks<deletePullRequestHeadRefMutation$data>) => void
  onRestoreHeadRef: ({onCompleted, onError}: RelayMutationCallbacks<restorePullRequestHeadRefMutation$data>) => void
}

/*
 * Displays closed and merged states for the merge box
 * For closed, only displays if the viewer can delete the head ref
 * For merged, only displays if the viewer can either delete the head ref or restore it
 */
export function ClosedOrMergedStateMergeBox({
  state,
  headRefName,
  headRepository,
  viewerCanDeleteHeadRef,
  viewerCanRestoreHeadRef,
  onDeleteHeadRef: onDeleteHeadRef,
  onRestoreHeadRef: onRestoreHeadRef,
}: Props & Callbacks) {
  const [error, setError] = useSafeState(false)
  const [isSubmitting, setIsSubmitting] = useSafeState(false)
  const [isDeletingBranch, setIsDeletingBranch] = useSafeState(false)

  if (state === 'OPEN' || (!viewerCanDeleteHeadRef && !viewerCanRestoreHeadRef)) {
    return null
  }

  const handleDeleteRef = () => {
    setIsSubmitting(true)
    setIsDeletingBranch(true)
    onDeleteHeadRef({
      onCompleted: () => {
        setError(false)
        setIsDeletingBranch(false)
        setIsSubmitting(false)
      },
      onError: () => {
        // TODO: We should be doing something with the error being returned here - @jah2488 (2024-04-22)
        setError(true)
        setIsSubmitting(false)
      },
    })
  }

  const handleRestoreRef = () => {
    setIsSubmitting(true)
    onRestoreHeadRef({
      onCompleted: () => {
        setError(false)
        setIsSubmitting(false)
      },
      onError: () => {
        // TODO: We should be doing something with the error being returned here - @jah2488 (2024-04-22)
        setError(true)
        setIsSubmitting(false)
      },
    })
  }

  const generateRepositoryURL = (): string => {
    if (!headRepository || !headRepository.name) {
      return ''
    }
    return branchPath({
      owner: headRepository.owner.login,
      repo: headRepository.name,
      branch: headRefName,
    })
  }

  const headingText =
    state === 'MERGED' ? 'Pull request successfully merged and closed' : 'Closed with unmerged commits'
  const borderColor =
    state === 'MERGED' ? borderColorClassForStatus(Status.Merged) : borderColorClassForStatus(Status.Closed)

  const actionButton = () => {
    if (viewerCanDeleteHeadRef) {
      return (
        <Button disabled={isSubmitting} onClick={handleDeleteRef} aria-busy={isDeletingBranch}>
          {isDeletingBranch ? (
            <div className="d-flex flex-row flex-items-center">
              <Spinner size={'small'} sx={{mr: 1}} />
              <span>Deleting branch...</span>
            </div>
          ) : (
            <span>Delete branch</span>
          )}
        </Button>
      )
    } else if (viewerCanRestoreHeadRef) {
      return (
        <Button disabled={isSubmitting} onClick={handleRestoreRef}>
          Restore branch
        </Button>
      )
    }
  }

  const subtitle = () => {
    if (state === 'MERGED') {
      if (viewerCanDeleteHeadRef) {
        return (
          <>
            You&#39;re all set &#8212; the <BranchName href={generateRepositoryURL()}>{headRefName}</BranchName> branch
            can be safely deleted.
          </>
        )
      } else if (viewerCanRestoreHeadRef) {
        return (
          <>
            You&#39;re all set &#8212; the <BranchName as="span">{headRefName}</BranchName> branch has been merged and
            deleted.
          </>
        )
      }
    } else {
      if (viewerCanDeleteHeadRef) {
        return (
          <>
            This pull request is closed, but the <BranchName href={generateRepositoryURL()}>{headRefName}</BranchName>{' '}
            branch has unmerged commits.
          </>
        )
      } else if (viewerCanRestoreHeadRef) {
        return (
          <>
            This pull request is closed and the <BranchName href={generateRepositoryURL()}> {headRefName} </BranchName>
            branch has been deleted.
          </>
        )
      }
    }
  }

  const mainContent = () => {
    if (error) {
      return (
        <MergeBoxSectionHeader
          title="Couldn&#39;t update branch"
          subtitle="Oops, something went wrong."
          rightSideContent={
            <Button disabled={isSubmitting} leadingVisual={SyncIcon} onClick={() => setError(false)}>
              Try again
            </Button>
          }
        />
      )
    } else {
      return <MergeBoxSectionHeader title={headingText} subtitle={subtitle()} rightSideContent={actionButton()} />
    }
  }

  return <div className={`width-full border ${borderColor} rounded-2`}>{mainContent()}</div>
}

/*
 * The relay connected wrapper for the ClosedOrMergedStateMergeBox component
 */
export function ClosedOrMergedStateMergeBoxWithRelay({id: pullRequestId, ...props}: Props & {id: string}) {
  const environment = useRelayEnvironment()

  const onDeleteHeadRef = ({
    onCompleted,
    onError,
  }: RelayMutationCallbacks<deletePullRequestHeadRefMutation$data>): void => {
    deletePullRequestHeadRefMutation({
      environment,
      input: {pullRequestId},
      onCompleted,
      onError,
    })
  }

  const onRestoreHeadRef = ({
    onCompleted,
    onError,
  }: RelayMutationCallbacks<restorePullRequestHeadRefMutation$data>): void => {
    restorePullRequestHeadRefMutation({
      environment,
      input: {pullRequestId},
      onCompleted,
      onError,
    })
  }
  return (
    <div className="d-flex flex-row position-relative">
      <ClosedOrMergedStateMergeBox {...props} onDeleteHeadRef={onDeleteHeadRef} onRestoreHeadRef={onRestoreHeadRef} />
    </div>
  )
}
