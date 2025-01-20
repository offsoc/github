import {RowsIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu} from '@primer/react'
import {useCallback, useMemo} from 'react'

import type {CustomProperty} from '../../../common/filter-providers/types'
import {useClickLogging} from '../../../common/hooks/use-click-logging'
import type {GroupKey} from '../../types'

type GroupOptions = {
  [key in GroupKey]: {
    label: string
  }
}

interface Props {
  groupKey: GroupKey
  onChange: (key: GroupKey) => void
  customProperties: CustomProperty[]
}

export function GroupMenu({groupKey, onChange, customProperties}: Props): JSX.Element {
  const {logClick} = useClickLogging({category: 'UnifiedAlerts.Group'})

  const onItemSelected = useCallback(
    (key: GroupKey) => {
      logClick({action: 'select group option', label: key})
      onChange(key)
    },
    [logClick, onChange],
  )

  const groupOptions: GroupOptions = useMemo(() => {
    const staticOptions: GroupOptions = {
      none: {
        label: 'None',
      },
      tool: {
        label: 'Tool',
      },
      severity: {
        label: 'Severity',
      },
      repo: {
        label: 'Repository',
      },
      'repo.visibility': {
        label: 'Visibility',
      },
      team: {
        label: 'Team',
      },
      topic: {
        label: 'Topic',
      },
      'dependabot.advisory': {
        label: 'Dependabot: advisory',
      },
    }

    const customOptions: GroupOptions = customProperties
      .filter(x => x.type !== 'string')
      .reduce((prev, curr) => {
        prev[`repo.props.${curr.name}`] = {
          label: `Property: ${curr.name}`,
        }
        return prev
      }, {} as GroupOptions)

    return {...staticOptions, ...customOptions}
  }, [customProperties])

  const groupKeyText = groupOptions[groupKey]?.label

  return (
    <ActionMenu>
      <ActionMenu.Button leadingVisual={RowsIcon}>{groupKeyText}</ActionMenu.Button>
      <ActionMenu.Overlay>
        <ActionList role="menu">
          <ActionList.Group>
            <ActionList.GroupHeading>Group by</ActionList.GroupHeading>
            {Object.entries(groupOptions).map(([key, opts]) => {
              return (
                <ActionList.Item
                  key={`group-${key}`}
                  role="menuitemradio"
                  sx={{whiteSpace: 'nowrap'}}
                  active={key === groupKey}
                  onSelect={() => onItemSelected(key as GroupKey)}
                >
                  {opts.label}
                </ActionList.Item>
              )
            })}
          </ActionList.Group>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
