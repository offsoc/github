import {useAnalytics} from '@github-ui/use-analytics'
import useSafeState from '@github-ui/use-safe-state'
import {ActionList, Button, Flash, Link, Octicon, Spinner} from '@primer/react'
import {useEffect, useRef, useState} from 'react'
import {graphql, useMutation} from 'react-relay'
import {MergeAction, MergeQueueMethod} from '../../../types'

import {ButtonWithDropdown} from '../common/ButtonWithDropdown'
import {mergeQueueButtonText} from '../../../helpers/merge-button-text'
import {StopIcon} from '@primer/octicons-react'
import {
  type Props as DirectMergeActionsSectionProps,
  DirectMergeActionsSection,
  type MergeButtonFocusProps,
} from './DirectMergeActionsSection'
import {MergeDropdownOption} from './MergeDropdownOption'
import type {
  MergeStateStatus,
  ViewerMergeActions,
  PullRequestMergeRequirements,
  MergeQueue,
  AutoMergeRequest,
} from '../../../types'
import {useDisableAutoMergeMutation} from '../../../hooks/use-disable-auto-merge-mutation'
import {assertDataPresent} from '@github-ui/assert-data-present'
import {useMergeMethodContext} from '../../../contexts/MergeMethodContext'
import {BypassMergeRequirementsToggle} from './BypassMergeRequirementsToggle'

const AUTOMERGE_DOCS_LINK =
  'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request'

export type AddToMergeQueueSectionProps = {
  autoMergeRequest: AutoMergeRequest
  baseRefName: string
  pullRequestId: string
  isDraft: boolean
  isInMergeQueue: boolean
  mergeQueue: MergeQueue
  mergeRequirementsState: PullRequestMergeRequirements['state']
  mergeStateStatus: MergeStateStatus
  viewerCanAddAndRemoveFromMergeQueue: boolean
}

/**
 * Renders the merge queue button and provides the ability to select from the merge queue methods
 */
function AddToMergeQueueSection({
  autoMergeRequest,
  baseRefName,
  pullRequestId,
  isDraft,
  isInMergeQueue,
  mergeQueue,
  mergeRequirementsState,
  mergeStateStatus,
  viewerCanAddAndRemoveFromMergeQueue,
  shouldFocusPrimaryMergeButton,
  setShouldFocusPrimaryMergeButton,
}: AddToMergeQueueSectionProps & MergeButtonFocusProps) {
  const mergeQueueUrl = mergeQueue?.url

  const [selectedMergeQueueOption, setSelectedMergeQueueOption] = useState<MergeQueueMethod>(MergeQueueMethod.GROUP)
  const [showConfirmMergeWhenReady, setShowConfirmMergeWhenReady] = useState(false)
  const [errorMessage, setErrorMessage] = useSafeState<string>()
  const {sendAnalyticsEvent} = useAnalytics()

  const [enableAutoMerge, isEnableInFlight] = useMutation(graphql`
    mutation MergeSection_enablePullRequestAutoMergeMutation($input: EnablePullRequestAutoMergeInput!) {
      enablePullRequestAutoMerge(input: $input) {
        pullRequest {
          autoMergeRequest {
            mergeMethod
          }
          viewerCanDisableAutoMerge
          isInMergeQueue
        }
      }
    }
  `)

  const enqueuePullRequest = () => {
    setShowConfirmMergeWhenReady(true)
    sendAnalyticsEvent('auto_merge_section.merge_click', 'MERGEBOX_AUTO_MERGE_BUTTON')
  }

  const createAutoMergeRequest = () => {
    if (isEnableInFlight) return

    // todo: add jump method along with permission checks for each option
    const mergeQueueMethod = selectedMergeQueueOption === MergeQueueMethod.SOLO ? 'SOLO' : 'GROUP'
    enableAutoMerge({
      variables: {input: {pullRequestId, mergeQueueMethod}},
      onError: () => {
        setErrorMessage('Failed to enable auto merge.')
      },
    })
    sendAnalyticsEvent('auto_merge_section.confirm_direct_merge', 'MERGEBOX_AUTO_MERGE_CONFIRMATION_BUTTON')
  }

  const updateMergeQueueMethod = (newMergeQueueMethod: MergeQueueMethod, analyticsEvent: string) => {
    setSelectedMergeQueueOption(newMergeQueueMethod)
    sendAnalyticsEvent(analyticsEvent, 'MERGEBOX_MERGE_QUEUE_SECTION_MERGE_METHOD_MENU_ITEM')
  }

  const isMergeable = mergeRequirementsState === 'MERGEABLE'
  const mergeWhenReadyDisabled =
    !viewerCanAddAndRemoveFromMergeQueue ||
    mergeStateStatus === 'UNKNOWN' ||
    isDraft ||
    isInMergeQueue ||
    !!autoMergeRequest

  const defaultBranchName = baseRefName

  const mergeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (showConfirmMergeWhenReady && mergeButtonRef?.current) {
      mergeButtonRef?.current.focus()
    }
  }, [showConfirmMergeWhenReady])

  return (
    <div className="d-flex flex-column d-flex flex-items-start gap-3">
      {errorMessage && (
        <Flash className="mb-3" variant="danger">
          <Octicon className="mr-2" icon={StopIcon} />
          {errorMessage}
        </Flash>
      )}
      <div className="d-flex flex-items-start flex-sm-items-center flex-column flex-sm-row gap-2 width-full">
        {showConfirmMergeWhenReady ? (
          <>
            <Button
              ref={mergeButtonRef}
              aria-busy={isEnableInFlight}
              aria-label={isEnableInFlight ? 'Creating auto merge request' : undefined}
              variant="primary"
              onClick={createAutoMergeRequest}
            >
              <div className="d-flex flex-items-center flex-row">
                {mergeQueueButtonText({mergeMethod: selectedMergeQueueOption, confirming: true})}
                {isEnableInFlight && <Spinner size="small" sx={{ml: 2}} />}
              </div>
            </Button>
            <Button
              onClick={() => {
                setShowConfirmMergeWhenReady(false)
                sendAnalyticsEvent(
                  'auto_merge_section.cancel_auto_merge',
                  'MERGEBOX_AUTO_MERGE_CANCEL_CONFIRMATION_BUTTON',
                )
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <div className="width-full">
            <>
              <ButtonWithDropdown
                inactive={mergeWhenReadyDisabled}
                inactiveTooltipText="Merging is blocked due to failing merge requirements"
                secondaryButtonAriaLabel="Select merge queue method"
                isPrimary={isMergeable}
                shouldFocusPrimaryButton={shouldFocusPrimaryMergeButton}
                onFocusPrimaryButton={() => setShouldFocusPrimaryMergeButton(false)}
                actionList={
                  <ActionList selectionVariant="single">
                    <>
                      <MergeDropdownOption
                        primaryText="Queue and merge in a group"
                        secondaryText={`This pull request will be automatically grouped with other pull requests and merged into ${defaultBranchName}.`}
                        selected={selectedMergeQueueOption === MergeQueueMethod.GROUP}
                        onSelect={() =>
                          updateMergeQueueMethod(
                            MergeQueueMethod.GROUP,
                            'merqe_queue_section.select_queue_and_merge_in_a_group',
                          )
                        }
                      />
                      <MergeDropdownOption
                        primaryText="Queue and force solo merge"
                        secondaryText={`This pull request will be merged into ${defaultBranchName} by itself.`}
                        selected={selectedMergeQueueOption === MergeQueueMethod.SOLO}
                        onSelect={() =>
                          updateMergeQueueMethod(
                            MergeQueueMethod.SOLO,
                            'merqe_queue_section.select_queue_and_force_solo_merge',
                          )
                        }
                      />
                    </>
                  </ActionList>
                }
                onPrimaryButtonClick={enqueuePullRequest}
              >
                {mergeQueueButtonText({
                  mergeMethod: selectedMergeQueueOption,
                  confirming: false,
                })}
              </ButtonWithDropdown>
              <span className="f6 fgColor-muted pl-2">
                This repository uses the{' '}
                <Link href={mergeQueueUrl} inline>
                  merge queue
                </Link>{' '}
                for all merges into the {defaultBranchName} branch.
              </span>
            </>
          </div>
        )}
      </div>
    </div>
  )
}

type DisableAutoMergeProps = {
  autoMergeRequest: AutoMergeRequest
  isMergeQueueEnabled?: boolean
  viewerCanDisableAutoMerge: boolean
  refetchMergeBoxQuery: () => void
}

/**
 * Renders the "disable auto merge" button when auto merge is currently enabled but the PR hasn't merged or been
 * added to the merge queue yet
 */
function DisableAutoMerge({
  autoMergeRequest,
  viewerCanDisableAutoMerge,
  isMergeQueueEnabled,
  refetchMergeBoxQuery,
}: DisableAutoMergeProps) {
  const {sendAnalyticsEvent} = useAnalytics()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isDisableInFlight, setIsDisableInFlight] = useState(false)

  const {mutate: disableAutoMerge} = useDisableAutoMergeMutation({
    onSuccess: () => {
      setIsDisableInFlight(false)
      refetchMergeBoxQuery()
    },
    onError: (e: Error) => {
      setErrorMessage(e.message)
    },
  })

  const handleDisableAutoMerge = () => {
    if (isDisableInFlight) return
    setIsDisableInFlight(true)
    disableAutoMerge()
    sendAnalyticsEvent('auto_merge_section.disable_auto_merge', 'MERGEBOX_AUTO_MERGE_DISABLE_BUTTON')
  }

  const autoMergeVerb = autoMergeRequest?.mergeMethod.toLowerCase() ?? 'merge'
  const autoMergeMessage = isMergeQueueEnabled ? 'be added to the merge queue' : `${autoMergeVerb} automatically`

  return (
    <div className="d-flex flex-column">
      {errorMessage && (
        <Flash className="mx-3 my-2" variant="danger">
          <Octicon className="mr-2" icon={StopIcon} />
          {errorMessage}
        </Flash>
      )}
      <div className="d-flex flex-row flex-items-center">
        <Button disabled={!viewerCanDisableAutoMerge} onClick={handleDisableAutoMerge}>
          <div className="d-flex flex-items-center flex-row">
            Disable auto-merge
            {isDisableInFlight && <Spinner size="small" sx={{ml: 2}} />}
          </div>
        </Button>
        <div className="d-flex flex-column flex-grow-1 ml-3">
          <div>
            This pull request will <span className="text-semibold">{autoMergeMessage}</span> when all requirements are
            met.{' '}
            <Link inline href={AUTOMERGE_DOCS_LINK}>
              Learn more.
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export type MergeSectionProps = {
  autoMergeRequest: AutoMergeRequest
  baseRefName: string
  commitAuthor: PullRequestMergeRequirements['commitAuthor']
  commitMessageBody: PullRequestMergeRequirements['commitMessageBody']
  commitMessageHeadline: PullRequestMergeRequirements['commitMessageHeadline']
  conflictsCondition: DirectMergeActionsSectionProps['conflictsCondition']
  id: string
  isDraft: boolean
  isInMergeQueue: boolean
  mergeQueue: MergeQueue
  mergeRequirementsState: PullRequestMergeRequirements['state']
  mergeStateStatus: MergeStateStatus
  numberOfCommits: number
  viewerCanAddAndRemoveFromMergeQueue: boolean
  viewerCanDisableAutoMerge: boolean
  viewerCanEnableAutoMerge: boolean
  viewerMergeActions: ViewerMergeActions
  isReadingFromJSONAPI: boolean
}

/**
 * Technically, this component still contains Relay since mutations in its children are still using Relay.
 */
export function MergeSectionWithRelay(props: MergeSectionProps & MergeButtonFocusProps) {
  return <MergeSection {...props} />
}

/**
 * Renders the merge actions section of the merge box, specifically the merge button
 * Depending on configurations, a viewer can select a merge method, merge directly, or add the pull request to the merge queue
 */
export function MergeSection({
  autoMergeRequest,
  baseRefName,
  commitAuthor,
  commitMessageBody,
  commitMessageHeadline,
  conflictsCondition,
  id,
  isDraft,
  isInMergeQueue,
  mergeQueue,
  mergeRequirementsState,
  mergeStateStatus,
  numberOfCommits,
  viewerCanAddAndRemoveFromMergeQueue,
  viewerCanDisableAutoMerge,
  viewerCanEnableAutoMerge,
  viewerMergeActions,
  isReadingFromJSONAPI,
  ...props
}: MergeSectionProps & MergeButtonFocusProps) {
  const [isAdminBypassToggleChecked, setIsAdminBypassToggleChecked] = useState(false)
  const {mergeMethod} = useMergeMethodContext()
  const mergeQueueMergeAction = viewerMergeActions.find(({name}) => name === MergeAction.MERGE_QUEUE)
  const directMergeAction = viewerMergeActions.find(action => action.name === MergeAction.DIRECT_MERGE)
  assertDataPresent(directMergeAction)
  const selectedMergeMethod = directMergeAction.mergeMethods.find(method => method.name === mergeMethod)
  const isAllowableWithBypass = selectedMergeMethod?.isAllowableWithBypass ?? false
  const isMergeQueueBypassRulesActive = isAllowableWithBypass && isAdminBypassToggleChecked

  const isMergeable = mergeRequirementsState === 'MERGEABLE'
  const isMergeQueueEnabled = mergeQueueMergeAction?.isAllowable
  const isDirectMergeEnabled = directMergeAction?.isAllowable
  const isAutoMergeActive = !!autoMergeRequest

  let mergeComponent
  if (isAutoMergeActive) {
    mergeComponent = (
      <DisableAutoMerge
        autoMergeRequest={autoMergeRequest}
        isMergeQueueEnabled={isMergeQueueEnabled}
        viewerCanDisableAutoMerge={viewerCanDisableAutoMerge}
        refetchMergeBoxQuery={props.refetchMergeBoxQuery}
      />
    )
  } else if (!isMergeQueueEnabled && !isDirectMergeEnabled) {
    // Inactive state
    mergeComponent = (
      <DirectMergeActionsSection
        baseRefName={baseRefName}
        conflictsCondition={conflictsCondition}
        numberOfCommits={numberOfCommits}
        pullRequestId={id}
        isDraft={isDraft}
        commitAuthor={commitAuthor}
        commitMessageBody={commitMessageBody}
        commitMessageHeadline={commitMessageHeadline}
        mergeRequirementsState={mergeRequirementsState}
        mergeable={false}
        viewerMergeActions={viewerMergeActions}
        {...props}
      />
    )
  } else if (isMergeQueueEnabled && isMergeQueueBypassRulesActive) {
    mergeComponent = (
      <DirectMergeActionsSection
        baseRefName={baseRefName}
        conflictsCondition={conflictsCondition}
        commitAuthor={commitAuthor}
        commitMessageBody={commitMessageBody}
        commitMessageHeadline={commitMessageHeadline}
        pullRequestId={id}
        isDraft={isDraft}
        numberOfCommits={numberOfCommits}
        mergeRequirementsState={mergeRequirementsState}
        mergeable={isMergeable}
        viewerMergeActions={viewerMergeActions}
        isMergeQueueBypassRulesActive={isMergeQueueBypassRulesActive}
        {...props}
      />
    )
  } else if (isMergeQueueEnabled) {
    mergeComponent = (
      <AddToMergeQueueSection
        autoMergeRequest={autoMergeRequest}
        baseRefName={baseRefName}
        pullRequestId={id}
        isDraft={isDraft}
        isInMergeQueue={isInMergeQueue}
        mergeQueue={mergeQueue}
        mergeRequirementsState={mergeRequirementsState}
        mergeStateStatus={mergeStateStatus}
        viewerCanAddAndRemoveFromMergeQueue={viewerCanAddAndRemoveFromMergeQueue}
        {...props}
      />
    )
  } else if (viewerCanEnableAutoMerge) {
    mergeComponent = (
      <DirectMergeActionsSection
        baseRefName={baseRefName}
        numberOfCommits={numberOfCommits}
        conflictsCondition={conflictsCondition}
        pullRequestId={id}
        isAutoMergeAllowed={true}
        isDraft={isDraft}
        commitAuthor={commitAuthor}
        commitMessageBody={commitMessageBody}
        commitMessageHeadline={commitMessageHeadline}
        mergeRequirementsState={mergeRequirementsState}
        mergeable={isMergeable}
        viewerMergeActions={viewerMergeActions}
        {...props}
      />
    )
  } else {
    mergeComponent = (
      <DirectMergeActionsSection
        baseRefName={baseRefName}
        conflictsCondition={conflictsCondition}
        numberOfCommits={numberOfCommits}
        pullRequestId={id}
        isDraft={isDraft}
        commitAuthor={commitAuthor}
        commitMessageBody={commitMessageBody}
        commitMessageHeadline={commitMessageHeadline}
        mergeRequirementsState={mergeRequirementsState}
        mergeable={isMergeable}
        viewerMergeActions={viewerMergeActions}
        {...props}
      />
    )
  }

  return (
    <div className="p-3 bgColor-muted borderColor-muted rounded-bottom-2">
      <>
        {isAllowableWithBypass && isReadingFromJSONAPI && (
          <div className="mb-3">
            <BypassMergeRequirementsToggle
              checked={isAdminBypassToggleChecked}
              onToggleChecked={() => setIsAdminBypassToggleChecked(!isAdminBypassToggleChecked)}
            />
          </div>
        )}
        {mergeComponent}
      </>
    </div>
  )
}
