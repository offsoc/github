import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {ListViewSectionFilterLink} from '@github-ui/list-view/ListViewSectionFilterLink'
import {Box} from '@primer/react'
import type React from 'react'
import {type ReactElement, useCallback} from 'react'

import type {CustomProperty} from '../../../common/filter-providers/types'
import type {GroupKey} from '../../types'
import {formatCount} from '../../utils/number-utils'
import {AlertListGroupItems} from '../alert-list-group-item'
import {AlertListItems} from '../alert-list-item'
import {GroupMenu} from './GroupMenu'
import {useAlertCountsQuery} from './use-alert-counts-query'

interface Props {
  openSelected: boolean
  closedSelected: boolean
  query: string
  groupKey: GroupKey
  onStateFilterChanged: (state: 'open' | 'closed') => void
  onGroupKeyChanged: (groupKey: GroupKey) => void
  customProperties: CustomProperty[]
}

export function AlertList(props: Props): JSX.Element {
  const {onStateFilterChanged} = props
  const onSectionFilterClicked = useCallback(
    (event: React.MouseEvent, state: 'open' | 'closed') => {
      onStateFilterChanged(state)
      event.preventDefault()
    },
    [onStateFilterChanged],
  )

  const countsQuery = useAlertCountsQuery({query: props.query})

  function renderListItems(): JSX.Element {
    if (props.groupKey === 'none') {
      return <AlertListItems groupKey={props.groupKey} query={props.query} />
    }

    return <AlertListGroupItems groupKey={props.groupKey} query={props.query} />
  }

  return (
    <Box sx={{borderWidth: 1, borderStyle: 'solid', borderColor: 'border.default', borderRadius: 6}}>
      <ListView
        variant="default"
        title="List of alert items"
        metadata={
          <ListViewMetadata
            sectionFilters={[
              <ListViewSectionFilterLink
                key="open"
                title="Open"
                href={''}
                isLoading={countsQuery.isPending}
                count={countsQuery.isSuccess ? formatCount(countsQuery.data.open) : 0}
                isSelected={props.openSelected}
                onClick={e => onSectionFilterClicked(e, 'open')}
              />,
              <ListViewSectionFilterLink
                key="closed"
                title="Closed"
                href={''}
                isLoading={countsQuery.isPending}
                count={countsQuery.isSuccess ? formatCount(countsQuery.data.closed) : 0}
                isSelected={props.closedSelected}
                onClick={e => onSectionFilterClicked(e, 'closed')}
              />,
            ]}
            actionsLabel="Actions"
            actions={[
              {
                key: 'select-grouping',
                render: (_isOverflowMenu: boolean): ReactElement => {
                  return (
                    <GroupMenu
                      groupKey={props.groupKey}
                      onChange={props.onGroupKeyChanged}
                      customProperties={props.customProperties}
                    />
                  )
                },
              },
            ]}
          />
        }
      >
        {renderListItems()}
      </ListView>
    </Box>
  )
}
