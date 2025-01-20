import {
  IssueOpenedIcon,
  ArrowRightIcon,
  LockIcon,
  TrashIcon,
  PinIcon,
  PinSlashIcon,
  CommentDiscussionIcon,
} from '@primer/octicons-react'
import {ActionList, CounterLabel, Heading, Octicon, Tooltip} from '@primer/react'
import {AnalyticsProvider} from '@github-ui/analytics-provider'

import {graphql} from 'relay-runtime'
import {useFragment, useRelayEnvironment} from 'react-relay'

import type {OptionConfig} from '../../components/OptionConfig'
import {BUTTON_LABELS} from '../../constants/buttons'
import {LABELS} from '../../constants/labels'
import type {OptionsSectionFragment$key} from './__generated__/OptionsSectionFragment.graphql'
import {IssueDeletionConfirmationDialog} from '../header/IssueDeletionConfirmationDialog'
import {useCallback, useMemo, useRef, useState} from 'react'
import {IssueConversationLock} from '../header/IssueConversationLock'
import {IssueTransferDialog} from '../header/IssueTransferDialog'
import {ConvertToDiscussionDialog} from '../ConvertToDiscussionDialog'
import {IssueTypesDialog} from '../header/IssueTypesDialog'
import {commitUnpinIssueMutation} from '../../mutations/unpin-issue'
import {commitPinIssueMutation} from '../../mutations/pin-issue'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ERRORS} from '../../constants/errors'
import {useKeyPress} from '@github-ui/use-key-press'
import {HOTKEYS} from '../../constants/hotkeys'
import type {OptionsSectionSecondary$key} from './__generated__/OptionsSectionSecondary.graphql'

const PINNED_ISSUES_LIMIT = 3

const OptionsSectionFragment = graphql`
  fragment OptionsSectionFragment on Issue {
    id
    isPinned
    locked
    viewerCanUpdateNext
    viewerCanDelete
    viewerCanTransfer
    viewerCanConvertToDiscussion
    viewerCanType
    repository {
      id
      name
      owner {
        login
      }
      isPrivate
      issueTypes(first: 10) {
        ...IssueTypesDialogIssueTypes
        totalCount
      }
      pinnedIssues(first: 3) {
        totalCount
      }
      viewerCanPinIssues
    }
    issueType {
      ...IssueTypesDialogIssueType
    }
  }
`

export type OptionsSectionProps = {
  optionsSection: OptionsSectionFragment$key
  optionsSectionSecondary?: OptionsSectionSecondary$key | null
  optionConfig: OptionConfig
}

export function OptionsSection({optionsSection, optionsSectionSecondary, optionConfig}: OptionsSectionProps) {
  const [showIssueTransferDialog, setShowIssueTransferDialog] = useState(false)
  const [showConvertToDiscussionDialog, setShowConvertToDiscussionDialog] = useState(false)
  const [showIssueDeletionConfirmationDialog, setShowIssueDeletionConfirmationDialog] = useState(false)
  const [showConversationLockDialog, setShowConversationLockDialog] = useState(false)
  const [showIssueTypesDialog, setShowIssueTypesDialog] = useState(false)

  useKeyPress(
    optionConfig.singleKeyShortcutsEnabled ? [HOTKEYS.issueTypesSection] : [],
    e => {
      if (showIssueTypesDialog) return
      setShowIssueTypesDialog(true)
      e.preventDefault()
    },
    {
      triggerWhenPortalIsActive: optionConfig.insideSidePanel,
    },
  )

  const {
    id,
    viewerCanUpdateNext,
    viewerCanTransfer,
    viewerCanDelete,
    viewerCanConvertToDiscussion,
    viewerCanType,
    isPinned,
    issueType,
    locked,
    repository,
  } = useFragment(OptionsSectionFragment, optionsSection)

  const secondaryData = useFragment(
    graphql`
      fragment OptionsSectionSecondary on Issue {
        isTransferInProgress
      }
    `,
    optionsSectionSecondary,
  )

  // If the secondary data is not available, we default to false
  const isTransferInProgress = secondaryData?.isTransferInProgress ?? false

  const viewerCanPin = repository.viewerCanPinIssues

  const pinnedIssuesCount = repository?.pinnedIssues?.totalCount || 0
  const issueTypesCount = repository?.issueTypes?.totalCount || 0

  const canPinNewIssue = pinnedIssuesCount < 3

  const analyticsMetadata = useMemo(
    () => ({
      owner: repository?.owner?.login ?? '',
      repositoryName: repository?.name ?? '',
      issueId: id,
    }),
    [id, repository?.name, repository?.owner?.login],
  )

  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()

  const pinUnpin = useCallback(() => {
    if (!viewerCanPin) return

    if (isPinned) {
      commitUnpinIssueMutation({
        environment,
        input: {issueId: id},
        onCompleted: () => {},
        onError: () => {},
      })
    } else {
      if (canPinNewIssue) {
        commitPinIssueMutation({
          environment,
          input: {issueId: id},
          onCompleted: () => {},
          onError: () => {
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'error',
              message: ERRORS.couldNotUnpinIssue,
            })
          },
        })
      }
    }
  }, [addToast, canPinNewIssue, environment, id, isPinned, viewerCanPin])

  const anchorRef = useRef<HTMLLIElement>(null)
  const disablePinningAction = !canPinNewIssue && !isPinned

  // Roll up all the permissions into a single boolean, so that we can conditionally render the options section
  const userHasActions =
    viewerCanUpdateNext ||
    viewerCanTransfer ||
    viewerCanDelete ||
    viewerCanPin ||
    viewerCanConvertToDiscussion ||
    viewerCanType

  if (!userHasActions) {
    return null
  }

  return (
    <>
      <Heading as="h2" className="sr-only" sx={{fontSize: 2, ml: 3, mb: 2}}>
        {LABELS.optionsTitle}
      </Heading>

      {/* Note to maintainers: If adding support for new permissions, make sure `userHasActions` is updated too */}
      <ActionList variant="full" sx={{mt: 2}}>
        {viewerCanType && issueTypesCount > 0 && (
          <ActionList.Item onSelect={() => setShowIssueTypesDialog(true)} sx={{fontSize: 0, py: 1}} ref={anchorRef}>
            <ActionList.LeadingVisual>
              <IssueOpenedIcon />
            </ActionList.LeadingVisual>
            {issueType ? BUTTON_LABELS.changeIssueType : BUTTON_LABELS.addIssueType}
          </ActionList.Item>
        )}

        {viewerCanTransfer && (
          <ActionList.Item onSelect={() => setShowIssueTransferDialog(true)} sx={{fontSize: 0, py: 1}}>
            <ActionList.LeadingVisual>
              <ArrowRightIcon />
            </ActionList.LeadingVisual>
            {BUTTON_LABELS.transferIssue}
          </ActionList.Item>
        )}

        {viewerCanUpdateNext && (
          <ActionList.Item onSelect={() => setShowConversationLockDialog(true)} sx={{fontSize: 0, py: 1}}>
            <ActionList.LeadingVisual>
              <LockIcon />
            </ActionList.LeadingVisual>
            {locked ? LABELS.lock.buttonConfirmUnlock : LABELS.lock.buttonConfirmLock}
          </ActionList.Item>
        )}

        {viewerCanPin && (
          <ActionList.Item
            aria-disabled={disablePinningAction || undefined}
            onSelect={pinUnpin}
            sx={{fontSize: 0, py: 1, color: disablePinningAction ? 'fg.muted' : 'fg.default'}}
          >
            <ActionList.LeadingVisual>
              <Octicon
                sx={{color: disablePinningAction ? 'fg.subtle' : 'fg.muted'}}
                icon={isPinned ? PinSlashIcon : PinIcon}
              />
            </ActionList.LeadingVisual>
            <Tooltip
              direction="s"
              sx={{width: '100%'}}
              text={
                disablePinningAction
                  ? '3/3 issues already pinned. Unpin an issue to pin this one.'
                  : isPinned
                    ? LABELS.unpinIssueTooltip
                    : LABELS.pinIssueTooltip
              }
            >
              {isPinned ? BUTTON_LABELS.unpinIssue : BUTTON_LABELS.pinIssue}
            </Tooltip>
            {pinnedIssuesCount > 0 && (
              <ActionList.TrailingVisual>
                <CounterLabel>
                  {pinnedIssuesCount}/{PINNED_ISSUES_LIMIT}
                </CounterLabel>
              </ActionList.TrailingVisual>
            )}
          </ActionList.Item>
        )}

        {viewerCanConvertToDiscussion && (
          <ActionList.Item onSelect={() => setShowConvertToDiscussionDialog(true)} sx={{fontSize: 0, py: 1}}>
            <ActionList.LeadingVisual>
              <CommentDiscussionIcon />
            </ActionList.LeadingVisual>
            {BUTTON_LABELS.convertToDiscussion}
          </ActionList.Item>
        )}
        {viewerCanDelete && (
          <ActionList.Item
            variant="danger"
            onSelect={() => setShowIssueDeletionConfirmationDialog(true)}
            sx={{fontSize: 0, py: 1}}
          >
            <ActionList.LeadingVisual>
              <TrashIcon />
            </ActionList.LeadingVisual>
            {BUTTON_LABELS.deleteIssue}
          </ActionList.Item>
        )}
      </ActionList>
      {showIssueTransferDialog && (
        <IssueTransferDialog
          owner={repository.owner.login}
          repository={repository.name}
          isRepoPrivate={repository.isPrivate}
          issueId={id}
          isTransferInProgress={isTransferInProgress}
          onClose={() => setShowIssueTransferDialog(false)}
        />
      )}
      {showConvertToDiscussionDialog && (
        <ConvertToDiscussionDialog
          owner={repository.owner.login}
          repository={repository.name}
          issueId={id}
          onClose={() => setShowConvertToDiscussionDialog(false)}
        />
      )}
      {viewerCanType && issueTypesCount > 0 && repository.issueTypes && (
        <AnalyticsProvider appName="issue_types" category="issue_viewer" metadata={analyticsMetadata}>
          {showIssueTypesDialog && (
            <IssueTypesDialog
              onClose={() => setShowIssueTypesDialog(false)}
              issueId={id}
              issueTypes={repository.issueTypes}
              initialSelectedType={issueType ? issueType : undefined}
              returnFocusRef={anchorRef}
            />
          )}
        </AnalyticsProvider>
      )}
      {showConversationLockDialog && (
        <IssueConversationLock issueId={id} isUnlocked={!locked} onClose={() => setShowConversationLockDialog(false)} />
      )}
      {showIssueDeletionConfirmationDialog && (
        <IssueDeletionConfirmationDialog
          issueId={id}
          onSuccessfulDeletion={optionConfig.onIssueDelete}
          afterDelete={optionConfig.navigateBack}
          onClose={() => setShowIssueDeletionConfirmationDialog(false)}
        />
      )}
    </>
  )
}
