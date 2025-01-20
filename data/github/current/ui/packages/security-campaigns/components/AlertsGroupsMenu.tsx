import {ActionList, ActionMenu} from '@primer/react'
import type {AlertsGroup} from '../types/get-alerts-groups-request'
import {CheckIcon, RowsIcon} from '@primer/octicons-react'

export type AlertsGroupsMenuProps = {
  group: AlertsGroup | null
  setGroup: (group: AlertsGroup | null) => void
}

export function AlertsGroupsMenu({group, setGroup}: AlertsGroupsMenuProps): React.ReactNode {
  const groups: Array<{key: AlertsGroup | null; value: string}> = [
    {key: null, value: 'None'},
    {key: 'repository', value: 'Repository'},
  ]

  return (
    <ActionMenu>
      <ActionMenu.Button aria-label="Group by" leadingVisual={RowsIcon}>
        Group by: <strong>{groups.find(({key}) => key === group)?.value}</strong>
      </ActionMenu.Button>
      <ActionMenu.Overlay>
        <ActionList role="menu">
          {groups.map(({key, value}) => (
            <ActionList.Item
              key={key}
              role="menuitemradio"
              sx={{whiteSpace: 'nowrap'}}
              onSelect={() => {
                setGroup(key)
              }}
            >
              <ActionList.LeadingVisual>{group === key && <CheckIcon />}</ActionList.LeadingVisual>
              {value}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
