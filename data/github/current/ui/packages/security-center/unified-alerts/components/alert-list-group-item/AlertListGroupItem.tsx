import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItemTrailingBadge} from '@github-ui/list-view/ListItemTrailingBadge'
import {ChevronDownIcon, ChevronRightIcon, DotFillIcon} from '@primer/octicons-react'
import {IconButton, Octicon, Text} from '@primer/react'
import {Stack} from '@primer/react/drafts'
import {useCallback, useState} from 'react'

import type {GroupKey, Severity} from '../../types'
import {formatCount} from '../../utils/number-utils'
import {AlertListItems} from '../alert-list-item'

export interface AlertListGroupItemProps {
  groupKey: GroupKey
  groupValue: string
  query: string
  label: string
  counts: {
    [key in Severity]: number
  }
  totalCount: number
}

export function AlertListGroupItem({
  groupKey,
  groupValue,
  query,
  label,
  counts,
  totalCount,
}: AlertListGroupItemProps): JSX.Element {
  const [expanded, setExpanded] = useState<boolean>(false)

  function getLeadingVisualIcon(): React.FC {
    return expanded ? ChevronDownIcon : ChevronRightIcon
  }

  const onToggle = useCallback(() => {
    setExpanded(!expanded)
  }, [expanded])

  const totalCountText = formatCount(totalCount)

  return (
    <>
      <ListItem
        sx={{backgroundColor: 'canvas.subtle'}}
        title={
          <ListItemTitle
            value={label}
            trailingBadges={[<ListItemTrailingBadge key={`${groupKey}-${groupValue}-total`} title={totalCountText} />]}
          />
        }
        metadata={
          <>
            <ListItemMetadata>
              <Stack direction="horizontal" justify="space-between">
                {Object.entries(counts).map(([severity, count]) => {
                  return (
                    <SeverityToken
                      key={`${groupKey}-${groupValue}-${severity}`}
                      severity={severity as Severity}
                      count={count}
                    />
                  )
                })}
              </Stack>
            </ListItemMetadata>
          </>
        }
      >
        <ListItemLeadingContent sx={{paddingLeft: 0}}>
          <IconButton
            aria-label="Toggle group"
            icon={getLeadingVisualIcon()}
            variant="invisible"
            size="large"
            onClick={onToggle}
          />
        </ListItemLeadingContent>
      </ListItem>

      {/* If the group is expanded, we render its child items linearly.
          The DOM does not actually represent a tree structure. */}
      {expanded && <AlertListItems groupKey={groupKey} groupValue={groupValue} query={query} />}
    </>
  )
}

interface SeverityTokenProps {
  severity: Severity
  count: number
}

function SeverityToken({severity, count}: SeverityTokenProps): JSX.Element {
  const severityText = severity.charAt(0).toUpperCase() + severity.slice(1)
  const countText = formatCount(count)

  function getIconColorClass(): string {
    switch (severity) {
      case 'critical':
        return 'color-fg-danger'
      case 'high':
        return 'color-fg-severe'
      case 'medium':
        return 'color-fg-attention'
      case 'low':
        return 'color-fg-primary'
    }
  }

  return (
    <div>
      <Octicon icon={DotFillIcon} className={getIconColorClass()} />
      <span>{severityText}</span>
      &nbsp;
      <Text sx={{fontWeight: 600}}>{countText}</Text>
    </div>
  )
}
