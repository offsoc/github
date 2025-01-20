import {Box} from '@primer/react'
import {useAnalytics} from '@github-ui/use-analytics'
import {useSessionStorage} from '@github-ui/use-safe-storage/session-storage'

import {MergeBoxSectionHeader} from './common/MergeBoxSectionHeader'
import {
  countChecksByGroup,
  STATUS_CHECK_ACCESSIBLE_NAMES,
  getAccessibleStatusText,
  extractChecksAnalyticsMetadata,
} from '../../helpers/status-check-helpers'
import {ExpandedChecksList} from './checks/ExpandedChecksList'
import {MergeBoxExpandable} from './common/MergeBoxExpandable'
import {useStatusChecksPageData} from '../../page-data/loaders/use-status-checks-page-data'
import type {CheckStateRollup, CombinedState} from '../../page-data/payloads/status-checks'
import {useStatusChecksLiveUpdates} from '../../hooks/use-status-checks-live-updates'
import {StatusCheckStatesIcon} from './checks/StatusCheckStatesIcon'

const CHECKS_SUMMARY_GROUPINGS = {
  FAILURE: ['ERROR', 'FAILURE', 'STARTUP_FAILURE'],
  TIMED_OUT: ['TIMED_OUT'],
  CANCELLED: ['CANCELLED'],
  SUCCESS: ['SUCCESS'],
  STALE: ['STALE'],
  PENDING: ['ACTION_REQUIRED', 'PENDING', 'WAITING', '_UNKNOWN_VALUE'],
  IN_PROGRESS: ['IN_PROGRESS'],
  QUEUED: ['QUEUED'],
  NEUTRAL: ['NEUTRAL'],
  SKIPPED: ['SKIPPED'],
  EXPECTED: ['EXPECTED'],
  REQUESTED: ['REQUESTED'],
}

/**
 *  Returns a text summary of the statuses of skipped, pending, failing, and successful checks
 *
 *  examples:
 *   - "4 successful checks"
 *   - "1 pending, 1 successful checks"
 *   - "2 failing, 3 successful checks"
 */
export function accessibleChecksSummary(checks: CheckStateRollup[]): string {
  if (checks.length === 0) {
    return 'No checks available.'
  }

  const groupedCheckCounts = countChecksByGroup(checks, CHECKS_SUMMARY_GROUPINGS)
  const totalCheckCounts = Object.keys(groupedCheckCounts).reduce((previous, key) => {
    const count = groupedCheckCounts[key]
    return count ? previous + count : previous
  }, 0)
  const summaryText = Object.keys(STATUS_CHECK_ACCESSIBLE_NAMES)
    .map(key => {
      const count = groupedCheckCounts[key] ?? 0
      const text = getAccessibleStatusText(key as keyof typeof STATUS_CHECK_ACCESSIBLE_NAMES)
      return count > 0 ? `${count} ${text}` : undefined
    })
    .filter(Boolean)
    .join(', ')

  return `${summaryText} ${totalCheckCounts > 1 ? 'checks' : 'check'}`
}

const heading: Record<CombinedState, string> = {
  PASSED: 'All checks have passed',
  PENDING: "Some checks haven't completed yet",
  PENDING_APPROVAL: 'Some checks are waiting for approval',
  PENDING_FAILED: 'Some checks were not successful',
  SOME_FAILED: 'Some checks were not successful',
  FAILED: 'All checks have failed',
}

/**
 *
 * Renders a collapsible checks section for a pull request
 */
export function ChecksSection({
  pullRequestId,
  pullRequestHeadSha,
}: {
  pullRequestId: string
  pullRequestHeadSha: string
}) {
  const {
    data: {aliveChannels, statusRollup, statusChecks},
  } = useStatusChecksPageData({pullRequestHeadSha})
  // expand checks state by default unless all checks pass or user has already collapsed toggle
  const isPassingChecksState = statusRollup.combinedState === 'PASSED'
  const [checksExpanded, setChecksExpanded] = useSessionStorage<boolean>(
    `${pullRequestId}:checksExpanded`,
    !isPassingChecksState,
  )
  const {sendAnalyticsEvent} = useAnalytics()

  useStatusChecksLiveUpdates(aliveChannels.commitHeadShaChannel, pullRequestHeadSha)

  // Don't render section if there are no checks
  if (statusRollup.summary.length === 0) return null

  return (
    <Box aria-label="Checks" as="section" sx={{borderBottom: '1px solid', borderColor: 'border.muted'}}>
      <MergeBoxSectionHeader
        title={heading[statusRollup.combinedState]}
        subtitle={accessibleChecksSummary(statusRollup.summary)}
        icon={<StatusCheckStatesIcon statusRollupSummary={statusRollup.summary} />}
        expandableProps={{
          ariaLabel: 'Checks details',
          isExpanded: checksExpanded,
          onToggle: () => {
            const eventMetadata = extractChecksAnalyticsMetadata(statusRollup.summary)
            const eventTarget = 'MERGEBOX_CHECKS_SECTION_TOGGLE_BUTTON'
            const eventType = !checksExpanded ? 'checks_section.expand' : 'checks_section.collapse'
            sendAnalyticsEvent(eventType, eventTarget, eventMetadata)
            setChecksExpanded(!checksExpanded)
          },
        }}
      />
      <MergeBoxExpandable isExpanded={checksExpanded}>
        <ExpandedChecksList statusChecks={statusChecks} statusRollupSummary={statusRollup.summary} />
      </MergeBoxExpandable>
    </Box>
  )
}
