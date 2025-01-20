import {assertDataPresent} from '@github-ui/assert-data-present'
import {useAnalytics} from '@github-ui/use-analytics'
import {ActionList} from '@primer/react'
import {useState} from 'react'

import {useMergeMethodContext} from '../../../contexts/MergeMethodContext'
import {mergeButtonText} from '../../../helpers/merge-button-text'
import {
  MergeMethod,
  MergeAction,
  type PullRequestMergeRequirements,
  type ViewerMergeActions,
  type ViewerMergeMethods,
  type PullRequestMergeConditionResult,
} from '../../../types'
import {ConfirmMerge} from '../../ConfirmMerge'
import {ButtonWithDropdown} from '../common/ButtonWithDropdown'
import {MergeDropdownOption} from './MergeDropdownOption'
import {BypassMergeRequirementsToggle} from './BypassMergeRequirementsToggle'

/**
 * Return a list of merge methods to show in the "select merge method" dropdown
 */
export function allowableMergeMethods({
  mergeMethods,
  bypassableOnly = false,
}: {
  mergeMethods: ViewerMergeMethods
  bypassableOnly?: boolean
}): MergeMethod[] {
  return mergeMethods.reduce<MergeMethod[]>((allowedMergeMethods, method) => {
    if ((!bypassableOnly && method?.isAllowable) || method?.isAllowableWithBypass) {
      allowedMergeMethods.push(method.name as MergeMethod)
    }

    return allowedMergeMethods
  }, [])
}

export type MergeButtonFocusProps = {
  shouldFocusPrimaryMergeButton: boolean
  setShouldFocusPrimaryMergeButton: (shouldFocus: boolean) => void
  refetchMergeBoxQuery: () => void
}

export type Props = {
  baseRefName: string
  numberOfCommits: number
  pullRequestId: string
  isDraft: boolean
  isAutoMergeAllowed?: boolean
  isMergeQueueBypassRulesActive?: boolean
  commitAuthor: PullRequestMergeRequirements['commitAuthor']
  commitMessageBody: PullRequestMergeRequirements['commitMessageBody']
  commitMessageHeadline: PullRequestMergeRequirements['commitMessageHeadline']
  mergeRequirementsState: PullRequestMergeRequirements['state']
  mergeable: boolean
  viewerMergeActions: ViewerMergeActions
  conflictsCondition: {result: PullRequestMergeConditionResult} | undefined
}

/**
 * Renders the merge button and provides the ability to select from the available merge methods
 */
export function DirectMergeActionsSection({
  baseRefName,
  numberOfCommits,
  conflictsCondition,
  pullRequestId,
  isDraft,
  commitAuthor,
  commitMessageBody,
  commitMessageHeadline,
  mergeRequirementsState,
  mergeable,
  refetchMergeBoxQuery,
  setShouldFocusPrimaryMergeButton,
  shouldFocusPrimaryMergeButton,
  viewerMergeActions,
  isAutoMergeAllowed = false,
  isMergeQueueBypassRulesActive,
}: Props & MergeButtonFocusProps) {
  const {mergeMethod, setMergeMethod} = useMergeMethodContext()
  const {sendAnalyticsEvent} = useAnalytics()

  const [isConfirmingSelectedMerge, setIsConfirmingSelectedMerge] = useState(false)
  const [isBypassRulesChecked, setIsBypassRulesChecked] = useState(false)

  // TODO: Allow ability to select from possible commit emails
  const commitAuthorEmail = commitAuthor

  if (!conflictsCondition) return null
  const hasConflict = 'result' in conflictsCondition && conflictsCondition.result === 'FAILED'
  const hasRebaseMergeConflict = hasConflict && mergeMethod === MergeMethod.REBASE
  const areMergeRequirementsBypassable = !hasConflict && !isDraft && mergeRequirementsState === 'UNMERGEABLE'

  const directMergeAction = viewerMergeActions.find(action => action.name === MergeAction.DIRECT_MERGE)
  assertDataPresent(directMergeAction)

  const allowedMergeMethods = allowableMergeMethods({mergeMethods: directMergeAction.mergeMethods})
  const bypassableMergeMethods = allowableMergeMethods({
    mergeMethods: directMergeAction.mergeMethods,
    bypassableOnly: true,
  })
  const canCreateMergeCommit = allowedMergeMethods.includes(MergeMethod.MERGE)
  const canSquashMerge = allowedMergeMethods.includes(MergeMethod.SQUASH)
  const canRebaseMerge = allowedMergeMethods.includes(MergeMethod.REBASE)
  const selectedMergeMethod = directMergeAction.mergeMethods.find(method => method.name === mergeMethod)

  // allow bypassing when there are no merge conflicts, the PR is not in draft, the user has permissions, and the PR is currenty unmergeable
  // evaluating isMergeQueueBypassRulesActive here so that the checkbox is not rendered twice
  const showBypassCheckbox = isMergeQueueBypassRulesActive
    ? !isMergeQueueBypassRulesActive
    : areMergeRequirementsBypassable && !!selectedMergeMethod?.isAllowableWithBypass

  // account for a scenario where the button is checked, then a live update causes the PR's state to update to
  // be mergeable and we stop showing the checkbox
  const isBypassRulesActive = isMergeQueueBypassRulesActive ?? (showBypassCheckbox && isBypassRulesChecked)

  // ensures that the user can switch merge methods via the dropdown when other merge options may be useable
  // even if the current option isn't
  const bypassableMethodsWithoutSelected = bypassableMergeMethods.filter(method => method !== selectedMergeMethod?.name)
  const isDropdownButtonActiveOverride =
    hasRebaseMergeConflict || (areMergeRequirementsBypassable && bypassableMethodsWithoutSelected.length > 0)

  const confirmMerge = () => {
    setIsConfirmingSelectedMerge(true)
    const analyticsEventKey = isAutoMergeAllowed
      ? 'direct_merge_section.auto_merge_click'
      : 'direct_merge_section.direct_merge_click'

    const analyticsEventValue = isAutoMergeAllowed
      ? 'MERGEBOX_AUTO_MERGE_SECTION_MERGE_BUTTON'
      : 'MERGEBOX_DIRECT_MERGE_SECTION_MERGE_BUTTON'

    sendAnalyticsEvent(analyticsEventKey, analyticsEventValue)
  }

  const cancelMerge = () => {
    setIsConfirmingSelectedMerge(false)
    setShouldFocusPrimaryMergeButton(true)

    const analyticsEventKey = isAutoMergeAllowed
      ? 'direct_merge_section.cancel_auto_merge'
      : 'direct_merge_section.cancel_direct_merge'

    const analyticsEventValue = isAutoMergeAllowed
      ? 'MERGEBOX_AUTO_MERGE_CANCEL_CONFIRMATION_BUTTON'
      : 'MERGEBOX_DIRECT_MERGE_CANCEL_CONFIRMATION_BUTTON'

    sendAnalyticsEvent(analyticsEventKey, analyticsEventValue)
  }

  const updateMergeMethod = (newMergeMethod: MergeMethod, analyticsEvent: string) => {
    setMergeMethod(newMergeMethod)
    sendAnalyticsEvent(analyticsEvent, 'MERGEBOX_DIRECT_MERGE_SECTION_MERGE_METHOD_MENU_ITEM')
  }

  if (isConfirmingSelectedMerge) {
    return (
      <ConfirmMerge
        commitAuthorEmail={commitAuthorEmail}
        commitMessageBody={commitMessageBody || ''}
        commitMessageHeadline={commitMessageHeadline || ''}
        defaultBranchName={baseRefName}
        isBypassMerge={isBypassRulesActive}
        pullRequestId={pullRequestId}
        selectedMergeMethod={mergeMethod}
        onCancel={cancelMerge}
        isAutoMergeAllowed={isAutoMergeAllowed}
        refetchMergeBoxQuery={refetchMergeBoxQuery}
      />
    )
  }

  return (
    <div className="d-flex flex-items-start flex-column gap-3">
      {showBypassCheckbox && (
        <BypassMergeRequirementsToggle
          checked={isBypassRulesChecked}
          onToggleChecked={() => setIsBypassRulesChecked(!isBypassRulesChecked)}
        />
      )}
      <div className="d-flex flex-items-start flex-sm-items-center flex-sm-row gap-3">
        <ButtonWithDropdown
          hideSecondaryButton={allowedMergeMethods.length === 1}
          inactive={isAutoMergeAllowed ? false : !mergeable && !isBypassRulesActive}
          inactiveTooltipText="Merging is blocked due to failing merge requirements"
          isPrimary={mergeable}
          secondaryButtonActive={isDropdownButtonActiveOverride}
          secondaryButtonAriaLabel="Select merge method"
          shouldFocusPrimaryButton={shouldFocusPrimaryMergeButton}
          actionList={
            <ActionList selectionVariant="single" showDividers>
              {canCreateMergeCommit && (
                <MergeDropdownOption
                  primaryText="Create a merge commit"
                  secondaryText="All commits from this branch will be added to the base branch via a merge commit."
                  selected={mergeMethod === MergeMethod.MERGE}
                  onSelect={() =>
                    updateMergeMethod(MergeMethod.MERGE, 'direct_merge_section.select_create_a_merge_commit')
                  }
                />
              )}
              {canSquashMerge && (
                <MergeDropdownOption
                  primaryText="Squash and merge"
                  secondaryText={
                    numberOfCommits === 1
                      ? 'The 1 commit from this branch will be added to the base branch.'
                      : `The ${numberOfCommits} commits from this branch will be combined into one commit in the base branch.`
                  }
                  selected={mergeMethod === MergeMethod.SQUASH}
                  onSelect={() => updateMergeMethod(MergeMethod.SQUASH, 'direct_merge_section.select_squash_and_merge')}
                />
              )}
              {canRebaseMerge && (
                <MergeDropdownOption
                  primaryText="Rebase and merge"
                  secondaryText={`The ${numberOfCommits} commit${
                    numberOfCommits !== 1 ? 's' : ''
                  } from this branch will be rebased and added to the base branch.`}
                  selected={mergeMethod === MergeMethod.REBASE}
                  onSelect={() => updateMergeMethod(MergeMethod.REBASE, 'direct_merge_section.select_rebase_and_merge')}
                />
              )}
            </ActionList>
          }
          onFocusPrimaryButton={() => setShouldFocusPrimaryMergeButton(false)}
          onPrimaryButtonClick={confirmMerge}
        >
          {mergeButtonText({
            mergeMethod,
            confirming: false,
            isBypassMerge: isBypassRulesActive,
            isAutoMergeAllowed,
          })}
        </ButtonWithDropdown>
        <span className="f6 fgColor-muted">
          You can also merge this with the command line, view command line instructions.
        </span>
      </div>
    </div>
  )
}
