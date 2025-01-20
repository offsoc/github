import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ChevronDownIcon, ChevronRightIcon} from '@primer/octicons-react'
import {IconButton, ProgressBar, Stack, Text} from '@primer/react'
import React from 'react'
import type {SecurityCampaignAlertGroup} from '../types/security-campaign-alert-group'
import pluralize from 'pluralize'

export interface AlertListGroupProps {
  group: SecurityCampaignAlertGroup
  expanded: boolean
  onExpandedChange?: (group: string) => void
  renderGroup: (group: SecurityCampaignAlertGroup) => React.ReactNode
}

const percentFormatter = new Intl.NumberFormat('en-US', {style: 'percent'})

export function AlertListGroup({group, expanded, onExpandedChange, renderGroup}: AlertListGroupProps): JSX.Element {
  const onToggle = React.useCallback(() => {
    onExpandedChange?.(group.title)
  }, [onExpandedChange, group.title])

  const totalCount = group.openCount + group.closedCount
  const fractionAlertsClosed = totalCount === 0 ? 0 : group.closedCount / totalCount

  const formattedPercentAlertsClosed = percentFormatter.format(fractionAlertsClosed)

  return (
    <>
      <ListItem
        sx={{backgroundColor: 'canvas.subtle', paddingY: 2}}
        title={<ListItemTitle value={group.title} />}
        metadata={
          <>
            <ListItemMetadata>
              <Stack gap="none">
                <Text sx={{paddingY: 0, marginY: 0}}>
                  {formattedPercentAlertsClosed} closed ({totalCount} {pluralize('alert', totalCount)})
                </Text>
                <ProgressBar
                  inline
                  sx={{minWidth: '12vw'}}
                  aria-valuetext={`Progress: ${formattedPercentAlertsClosed} of ${pluralize(
                    'alert',
                    group.closedCount,
                  )} closed`}
                >
                  <ProgressBar.Item progress={fractionAlertsClosed * 100} sx={{backgroundColor: 'purple'}} />
                </ProgressBar>
              </Stack>
            </ListItemMetadata>
          </>
        }
      >
        <ListItemLeadingContent sx={{paddingLeft: 0}}>
          <IconButton
            aria-label={`Toggle ${group.title}`}
            icon={expanded ? ChevronDownIcon : ChevronRightIcon}
            variant="invisible"
            size="large"
            onClick={onToggle}
          />
        </ListItemLeadingContent>
      </ListItem>

      {expanded && renderGroup(group)}
    </>
  )
}
