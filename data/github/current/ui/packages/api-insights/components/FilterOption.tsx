import {ActionMenu, ActionList} from '@primer/react'
import {useReplaceSearchParams} from '../hooks/UseReplaceSearchParams'
import {useState, useEffect} from 'react'
import type {Group} from '../types/filter-types'

export interface FilterOptionProps {
  name: string
  group: Group
}

export function FilterOption({name, group}: FilterOptionProps) {
  const {replaceSearchParams} = useReplaceSearchParams()
  const {selected_value} = group
  const [selected, setSelected] = useState(selected_value)
  useEffect(() => {
    // useState(selected_value) only uses selected_value on first render, so trigger an update if needed.
    // The most common use case is when another filter is selected, and the current filter is
    // reset to another default because it is an invalid combination.
    setSelected(selected_value)
  }, [selected_value])

  const selectedItem = group.options.find(option => option.value === selected)

  return (
    <>
      <ActionMenu>
        <ActionMenu.Button>
          <span className="fgColor-muted">
            {name}
            {selectedItem && ': '}
          </span>
          {selectedItem && <span>{selectedItem.name}</span>}
        </ActionMenu.Button>
        <ActionMenu.Overlay width="auto">
          <ActionList selectionVariant="multiple">
            <ActionList.Group key={group.query_param}>
              {group.name && <ActionList.GroupHeading>{group.name}</ActionList.GroupHeading>}
              {group.options.map(option => {
                return (
                  <ActionList.Item
                    key={option.name}
                    selected={selected_value === option.value}
                    disabled={option.disabled}
                    onSelect={() => {
                      setSelected(option.value)
                      replaceSearchParams(group.query_param, option.value)
                    }}
                  >
                    {option.name}
                  </ActionList.Item>
                )
              })}
            </ActionList.Group>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </>
  )
}
