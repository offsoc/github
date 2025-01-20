import {useState} from 'react'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {branchPath, userHovercardPath} from '@github-ui/paths'
import {BranchName, Button, Dialog, Link, Portal, Spinner} from '@primer/react'
import {RefSelector} from '@github-ui/ref-selector'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {InlineMessage, Tooltip} from '@primer/react/drafts'
import type {PullRequestState} from './PullRequestStateLabel'
import {useChangeBaseBranchMutation} from '../mutations/use-change-base-branch-mutation'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {usePageDataUrl} from '@github-ui/pull-request-page-data-tooling/use-page-data-url'
import styles from './PullRequestHeaderSummary.module.css'

interface CommitsAppPayload {
  helpUrl: string
  refListCacheKey: string
}

export interface PullRequestHeaderSummaryProps {
  author: string
  baseBranch: string
  baseRepositoryDefaultBranch?: string
  baseRepositoryOwnerLogin: string
  baseRepositoryName: string
  canChangeBase?: boolean
  commitsCount: number
  headBranch: string
  headRepositoryOwnerLogin?: string
  headRepositoryName?: string
  isInAdvisoryRepo?: boolean
  isEditing?: boolean
  mergedBy?: string
  setIsEditing?: (isEditing: boolean) => void
  state: PullRequestState
}

export function PullRequestHeaderSummary({
  author,
  baseBranch,
  baseRepositoryDefaultBranch = '',
  baseRepositoryName = '',
  baseRepositoryOwnerLogin = '',
  canChangeBase = false,
  commitsCount,
  headBranch,
  headRepositoryOwnerLogin = '',
  headRepositoryName = '',
  isInAdvisoryRepo,
  isEditing = false,
  mergedBy,
  setIsEditing,
  state,
}: PullRequestHeaderSummaryProps) {
  const {refListCacheKey} = useAppPayload<CommitsAppPayload>()
  const [isConfirmingChangeBase, setIsConfirmingChangeBase] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [candidateBaseBranch, setCandidateBaseBranch] = useState('')

  const headerUrl = usePageDataUrl(PageData.header)
  const commitsUrl = usePageDataUrl(PageData.commits)
  const {mutate: mutateChangeBaseBranch} = useChangeBaseBranchMutation()

  const onSelectItem = (selectedBaseBranch: string) => {
    setIsConfirmingChangeBase(true)
    setCandidateBaseBranch(selectedBaseBranch)
  }
  const onCancelChangeBase = () => {
    setIsConfirmingChangeBase(false)
    setCandidateBaseBranch('')
    setErrorMessage('')
  }
  const handleChangeBaseError = (message: string) => {
    setIsLoading(false)
    setErrorMessage(message)
  }
  const onConfirmChangeBase = () => {
    setIsLoading(true)
    mutateChangeBaseBranch(
      {newBaseBranch: candidateBaseBranch},
      {
        onError: error => handleChangeBaseError(error.message),
        onSuccess: async () => {
          try {
            await Promise.all([
              // We're using refetchQueries here instead of invalidateQueries in order to ensure that the
              // page data is updated *before* the confirmation dialog is closed, for a smoother overall UX.
              queryClient.refetchQueries({queryKey: [PageData.header, headerUrl]}, {throwOnError: true}),
              queryClient.refetchQueries({queryKey: [PageData.commits, commitsUrl]}, {throwOnError: true}),
            ])
            setIsLoading(false)
            setIsEditing?.(false)
            setIsConfirmingChangeBase(false)
          } catch {
            handleChangeBaseError('Unable to refetch commits. Please refresh the page.')
          }
        },
      },
    )
  }

  const baseBranchUrl = branchPath({owner: baseRepositoryOwnerLogin, repo: baseRepositoryName, branch: baseBranch})
  const headBranchUrl = branchPath({owner: headRepositoryOwnerLogin, repo: headRepositoryName, branch: headBranch})

  const buttonLabel = isLoading ? null : 'Change base'
  const buttonLeadingVisual = isLoading ? () => <Spinner size="small" /> : null

  let baseBranchText = baseBranch
  let headRepositoryText = ''

  if (isInAdvisoryRepo && headRepositoryName) {
    headRepositoryText = `${headRepositoryName}`
  }

  if (headRepositoryOwnerLogin && headRepositoryOwnerLogin !== baseRepositoryOwnerLogin) {
    baseBranchText = `${baseRepositoryOwnerLogin}:${baseBranch}`
    if (headRepositoryText) {
      headRepositoryText = `${headRepositoryOwnerLogin}/${headRepositoryText}`
    } else {
      headRepositoryText = headRepositoryOwnerLogin
    }
  }
  const headBranchText = headRepositoryOwnerLogin
    ? headRepositoryText
      ? `${headRepositoryText}:${headBranch}`
      : headBranch
    : 'unknown repository'

  const summaryActor = state === 'merged' ? mergedBy : author
  const messageText = getSummaryMessageText(state, commitsCount, summaryActor)

  return (
    <span className="fgColor-muted d-flex flex-items-center flex-wrap" style={{gap: '0px 4px'}}>
      {summaryActor ? (
        <>
          <Link
            inline={true}
            className="fgColor-muted text-bold"
            data-hovercard-url={userHovercardPath({owner: summaryActor})}
            href={`/${summaryActor}`}
          >
            {summaryActor}
          </Link>{' '}
        </>
      ) : null}
      {messageText}
      {canChangeBase && isEditing ? (
        <>
          <RefSelector
            cacheKey={refListCacheKey}
            canCreate={false}
            closeOnSelect
            currentCommitish={baseBranch}
            defaultBranch={baseRepositoryDefaultBranch}
            hideShowAll
            owner={baseRepositoryOwnerLogin}
            repo={baseRepositoryName}
            types={['branch']}
            onSelectItem={onSelectItem}
          />
          <Portal>
            <Dialog
              aria-labelledby="confirm-change-base-branch"
              isOpen={isConfirmingChangeBase}
              onDismiss={onCancelChangeBase}
            >
              <Dialog.Header id="confirm-change-base-branch">Are you sure you want to change the base?</Dialog.Header>
              <div className="p-3">
                <span>
                  Some commits from the old base branch may be removed from the timeline, and old review comments may
                  become outdated.
                </span>
                {errorMessage && (
                  <InlineMessage className="mt-2" variant="critical">
                    {errorMessage}
                  </InlineMessage>
                )}
                {/* Loading message accessible to screen readers only. See https://primer.style/components/button#button-loading-state */}
                <span className="sr-only" aria-live="polite">
                  {isLoading ? 'Base branch update in progress.' : ''}
                </span>
                <Button
                  // aria-disabled must be not set when false to avoid broken styling
                  alignContent="center"
                  aria-disabled={isLoading ? 'true' : undefined}
                  block
                  className="mt-3"
                  disabled={isLoading}
                  leadingVisual={buttonLeadingVisual}
                  onClick={onConfirmChangeBase}
                  variant="primary"
                >
                  {buttonLabel}
                </Button>
              </div>
            </Dialog>
          </Portal>
        </>
      ) : (
        <Tooltip text={`${baseRepositoryOwnerLogin}/${baseRepositoryName}:${baseBranch}`}>
          <BranchName href={baseBranchUrl} className={styles.truncateBranch}>
            {baseBranchText}
          </BranchName>
        </Tooltip>
      )}
      from{' '}
      <Tooltip
        text={
          headRepositoryName
            ? `${headRepositoryOwnerLogin}/${headRepositoryName}:${headBranch}`
            : 'This repository has been deleted'
        }
      >
        <BranchName href={headBranchUrl} className={styles.truncateBranch}>
          {headBranchText}
        </BranchName>
      </Tooltip>
      <CopyToClipboardButton
        accessibleButton={true}
        ariaLabel="Copy head branch name to clipboard"
        avoidStyledComponent={true}
        size="small"
        textToCopy={headRepositoryOwnerLogin ? headBranchText : headBranch}
      />
    </span>
  )
}

function getSummaryMessageText(state: PullRequestState, commitsCount: number, actor?: string) {
  const commitsNumberText = `${commitsCount} ${commitsCount > 1 ? 'commits' : 'commit'}`

  if (state === 'merged') {
    if (actor) {
      return `merged ${commitsNumberText} into`
    } else {
      return `${commitsNumberText} merged into`
    }
  } else {
    return `wants to merge ${commitsNumberText} into`
  }
}
