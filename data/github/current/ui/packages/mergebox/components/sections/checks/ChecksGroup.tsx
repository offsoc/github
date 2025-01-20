import {useAnalytics} from '@github-ui/use-analytics'
import {ActionList, Button} from '@primer/react'
import {type PropsWithChildren, useState, useId} from 'react'
import type {STATUS_CHECK_ACCESSIBLE_NAMES} from '../../../helpers/status-check-helpers'
import {getAccessibleStatusText} from '../../../helpers/status-check-helpers'
import styles from './ExpandedChecks.module.css'
import {clsx} from 'clsx'
import {ExpandableGroupIcon} from '../common/ExpandableGroupIcon'

export function ChecksGroup({
  children,
  count,
  groupStatus,
  isOpenByDefault,
  isToggleVisible,
  analyticsMetadata,
}: PropsWithChildren<{
  count: number
  groupStatus: string
  analyticsMetadata: {statusCheckCounts: Record<string, number>}
  isOpenByDefault?: boolean
  isToggleVisible?: boolean
}>) {
  const [isOpen, setIsOpen] = useState(isOpenByDefault)
  const {sendAnalyticsEvent} = useAnalytics()
  const groupStatusText = getAccessibleStatusText(groupStatus as keyof typeof STATUS_CHECK_ACCESSIBLE_NAMES)
  const groupContentId = useId()
  const showListToggle = isToggleVisible
  const showChecksList = isOpen || !isToggleVisible

  return (
    <div>
      {showListToggle && (
        <Button
          aria-controls={groupContentId}
          aria-expanded={isOpen}
          className={styles.checksGroupHeadingButton}
          variant="invisible"
          size="small"
          trailingVisual={() => <ExpandableGroupIcon isExpanded={Boolean(isOpen)} />}
          onClick={() => {
            const eventTarget = 'MERGEBOX_CHECKS_GROUP_TOGGLE_BUTTON'
            const eventType = isOpen ? 'checks_group.collapse' : 'checks_group.expand'
            const eventMetadata = {...analyticsMetadata, group: groupStatus}
            sendAnalyticsEvent(eventType, eventTarget, eventMetadata)
            setIsOpen(!isOpen)
          }}
        >
          {count} {groupStatusText} check{count > 1 ? 's' : ''}
        </Button>
      )}
      <div
        className={clsx(styles.expandableWrapper, showChecksList && styles.isExpanded)}
        //  We're setting visibility directly because tests don't pick up styles from modules
        style={{visibility: showChecksList ? 'visible' : 'hidden'}}
      >
        <div className={clsx(styles.expandableContent)} role="group" aria-label={`${groupStatusText} checks`}>
          <ActionList id={groupContentId} className={styles.checksGroupActionList} showDividers>
            {children}
          </ActionList>
        </div>
      </div>
    </div>
  )
}
