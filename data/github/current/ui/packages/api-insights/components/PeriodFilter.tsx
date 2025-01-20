import {ActionMenu, ActionList} from '@primer/react'
import {useReplaceSearchParams} from '../hooks/UseReplaceSearchParams'
import {useState, useEffect} from 'react'
import {Dialog} from '@primer/react/experimental'
import type {Group, Groups} from '../types/filter-types'

type StringKeyObject = {
  [key: string]: string
}

export interface PeriodFilterProps {
  name: string
  groups: Groups
}

export function PeriodFilter({name, groups}: PeriodFilterProps) {
  const {searchParams, replaceSearchParams} = useReplaceSearchParams()
  const initialState = groups.reduce((prev: StringKeyObject, curr: Group) => {
    if (curr.query_param) {
      prev[curr.query_param] = searchParams.get(curr.query_param) || curr.selected_value
    }
    return prev
  }, {})
  const [selectedState, setSelected] = useState<StringKeyObject>(initialState)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // useState(initialState) only uses initialState on first render, so trigger an update if needed.
    // The most common use case is when another filter is selected, and the current filter is
    // reset to another default because it is an invalid combination.

    // To avoid infinite updates, only trigger an update if objects are different. If state is ever
    // updated to be nested, the comparison strategy will need to be updated.
    const initial = JSON.stringify(initialState, Object.keys(initialState).sort())
    const selected = JSON.stringify(selectedState, Object.keys(selectedState).sort())
    if (initial !== selected) {
      setSelected(initialState)
    }
  }, [selectedState, initialState])

  if (!(groups && groups.length > 0)) return null
  const firstGroup = groups[0]
  if (!firstGroup) return null
  const selectedItem = firstGroup.options.find(option => option.value === selectedState[firstGroup.query_param])

  return (
    <>
      {isOpen && (
        <Dialog
          title="Custom range"
          onClose={() => {
            setIsOpen(false)
          }}
        />
      )}
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
            {groups.map((group, index) => (
              <ActionList.Group key={group.query_param}>
                {group.name && <ActionList.GroupHeading>{group.name}</ActionList.GroupHeading>}
                {group.options.map(option => {
                  return (
                    <ActionList.Item
                      key={option.name}
                      selected={selectedState[group.query_param] === option.value}
                      disabled={option.disabled}
                      onSelect={() => {
                        if (option.is_custom) {
                          setIsOpen(true)
                          return
                        }
                        setSelected({...selectedState, [group.query_param]: option.value})
                        replaceSearchParams(group.query_param, option.value)
                      }}
                    >
                      {option.name}
                    </ActionList.Item>
                  )
                })}
                {index + 1 < groups.length && <ActionList.Divider />}
              </ActionList.Group>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </>
  )
}
