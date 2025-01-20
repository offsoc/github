import {useMemo} from 'react'

import {
  compareChecks,
  countChecksByGroup,
  groupChecks,
  extractChecksAnalyticsMetadata,
} from '../../../helpers/status-check-helpers'
import styles from './ExpandedChecks.module.css'
import {ChecksGroup} from './ChecksGroup'
import {StatusCheckRow} from './StatusCheckRow'
import type {CheckStateRollup, StatusCheck} from '../../../page-data/payloads/status-checks'

const CHECKS_LIST_GROUPINGS = {
  FAILURE: ['CANCELLED', 'ERROR', 'FAILURE', 'STALE', 'STARTUP_FAILURE', 'TIMED_OUT'],
  PENDING: ['ACTION_REQUIRED', 'EXPECTED', 'PENDING', 'QUEUED', 'REQUESTED', 'WAITING', '_UNKNOWN_VALUE'],
  IN_PROGRESS: ['IN_PROGRESS'],
  SKIPPED: ['SKIPPED'],
  NEUTRAL: ['NEUTRAL'],
  SUCCESS: ['SUCCESS', 'COMPLETED'],
}

interface Props {
  statusChecks: StatusCheck[]
  statusRollupSummary: CheckStateRollup[]
}

/**
 * Displays the list of expanded checks
 */
export function ExpandedChecksList({statusChecks, statusRollupSummary}: Props) {
  const sortedChecksOrStatuses = useMemo(() => statusChecks.sort(compareChecks), [statusChecks])
  const countsByGroup = countChecksByGroup(statusRollupSummary, CHECKS_LIST_GROUPINGS)
  const checksByGroup = groupChecks(sortedChecksOrStatuses, CHECKS_LIST_GROUPINGS, check => check.state)

  // count how many groups actually have items
  const groupsWithItemsCount = Object.entries(countsByGroup).reduce<number>(
    (groupsWithItems, [, count]) => (count > 0 ? groupsWithItems + 1 : groupsWithItems),
    0,
  )

  return (
    <div className={styles.checksContainer}>
      {Object.entries(countsByGroup).map(([groupStatus, count]) => {
        if (count === 0) return null

        // close the success group by default unless it's the only group
        const isOpenByDefault = groupStatus !== 'SUCCESS' || groupsWithItemsCount === 1
        const isToggleVisible = groupsWithItemsCount > 1
        return (
          <ChecksGroup
            key={groupStatus}
            count={count}
            groupStatus={groupStatus}
            isOpenByDefault={isOpenByDefault}
            isToggleVisible={isToggleVisible}
            analyticsMetadata={extractChecksAnalyticsMetadata(statusRollupSummary)}
          >
            {checksByGroup[groupStatus]?.map((checkOrStatus, idx) => {
              if (!checkOrStatus) return null
              return <StatusCheckRow key={idx} {...checkOrStatus} />
            })}
          </ChecksGroup>
        )
      })}
    </div>
  )
}
