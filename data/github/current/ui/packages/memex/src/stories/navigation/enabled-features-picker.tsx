import {BeakerIcon} from '@primer/octicons-react'
import {type AnchoredOverlayProps, Button} from '@primer/react'
import {ActionList} from '@primer/react/deprecated'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {SelectPanel} from '@primer/react/lib-esm/SelectPanel/SelectPanel'
import {hasMatch} from 'fzy.js'
import isEqual from 'lodash-es/isEqual'
import {useCallback, useMemo, useState} from 'react'

import {enabledFeatures} from '../../client/api/enabled-features/contracts'
import {getEnabledFeatures} from '../../client/helpers/feature-flags'
import {defaultEnabledFeaturesConfig} from '../../mocks/generate-enabled-features-from-url'
import {navItemOverlaySx} from './styles'

type EnabledFeatureToggleItem = ItemInput & {value: string}

const NullVisual = () => null

const groups = {
  quick: 'quick',
  flags: 'flags',
}

const groupMetadata = Object.values(groups).map(groupId => ({groupId}))

export function EnabledFeaturesPicker() {
  const [isOpen, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [items] = useState<Array<EnabledFeatureToggleItem>>(() => {
    return enabledFeatures.map(key => {
      const selected = getEnabledFeatures()[key]
      return {
        text: `${key} (default: ${selected ? 'enabled' : 'disabled'})`,
        value: key,
        selected,
        groupId: groups.flags,
      }
    })
  })
  const [initialSelected] = useState<Array<ItemInput & {value?: string}>>(() => {
    return items.filter(item => item.selected)
  })
  const [selected, setSelected] = useState<Array<ItemInput & {value?: string}>>(initialSelected)

  const handleSubmit = useCallback(
    function handleSubmit() {
      const currentSelected = selected.map(item => item.value).sort((a, b) => a?.localeCompare(b ?? '') ?? 0)
      const originalSelected = initialSelected.map(item => item.value).sort((a, b) => a?.localeCompare(b ?? '') ?? 0)
      // if we have a different ending set of feature flags
      if (!isEqual(currentSelected, originalSelected)) {
        const searchParams = new URLSearchParams(window.location.search)

        const featuresForUrl = Object.entries(defaultEnabledFeaturesConfig).reduce<Array<string>>(
          (acc, [featureName, defaultValue]) => {
            /**
             * if it is going to be enabled, and the default is false
             * if it is not going to be enabled, but the default was true disable it
             */

            if (currentSelected.includes(featureName) && !defaultValue) {
              acc.push(`${featureName}:true`)
            } else if (!currentSelected.includes(featureName) && defaultValue) {
              acc.push(`${featureName}:false`)
            }
            return acc
          },
          [],
        )

        if (featuresForUrl.length === 0) {
          searchParams.delete('_memex_server_features')
        } else {
          searchParams.set('_memex_server_features', featuresForUrl.join(','))
        }

        const pathname = `${window.location.origin}${window.location.pathname}`
        const search = searchParams.toString()
        window.location.href = search ? `${pathname}?${search}` : pathname
      }
      setOpen(false)
    },
    [initialSelected, selected],
  )

  const resetSelected = useCallback(() => setSelected(initialSelected), [initialSelected])

  const panelItems = useMemo(() => {
    const initialItems: Array<EnabledFeatureToggleItem | ItemInput> = [
      {
        groupId: groups.quick,
        text: 'All',
        value: 'all',
        selected: false,
        renderItem() {
          return (
            <ActionList.Item
              sx={{mx: 2}}
              onAction={() => {
                setSelected(items)
              }}
              leadingVisual={NullVisual}
            >
              Select all
            </ActionList.Item>
          )
        },
      },

      {
        groupId: groups.quick,
        text: 'Default',
        value: 'default',
        selected: false,
        renderItem() {
          return (
            <ActionList.Item
              sx={{mx: 2}}
              onAction={() => {
                setSelected(
                  items.filter(
                    item => defaultEnabledFeaturesConfig[item.value as keyof typeof defaultEnabledFeaturesConfig],
                  ),
                )
              }}
              leadingVisual={NullVisual}
            >
              Select default
            </ActionList.Item>
          )
        },
      },

      {
        groupId: groups.quick,
        text: 'None',
        value: 'none',
        selected: false,
        renderItem() {
          return (
            <ActionList.Item
              sx={{mx: 2}}
              onAction={() => {
                setSelected([])
              }}
              leadingVisual={NullVisual}
            >
              Select none
            </ActionList.Item>
          )
        },
      },

      {
        groupId: groups.quick,
        text: 'Reset',
        value: 'reset',
        selected: false,
        renderItem() {
          return (
            <ActionList.Item
              sx={{mx: 2}}
              onAction={() => {
                resetSelected()
              }}
              leadingVisual={NullVisual}
            >
              Reset to current {initialSelected.length} enabled items
            </ActionList.Item>
          )
        },
      },
    ]

    return initialItems.concat(
      filter.trim() ? items.filter(item => item.text != null && hasMatch(filter, item.text)) : items,
    )
  }, [filter, items, resetSelected, initialSelected.length])

  const renderAnchor: NonNullable<AnchoredOverlayProps['renderAnchor']> = useCallback(
    ({children, 'aria-labelledby': ariaLabelledBy, ...anchorProps}) => {
      return (
        <Button leadingVisual={BeakerIcon} aria-labelledby={` ${ariaLabelledBy}`} {...anchorProps} size="small">
          ({initialSelected.length}/{items.length})
        </Button>
      )
    },
    [initialSelected.length, items.length],
  )

  return (
    <SelectPanel
      placeholderText="Find features"
      onFilterChange={setFilter}
      filterValue={filter}
      open={isOpen}
      groupMetadata={groupMetadata}
      onSelectedChange={setSelected as any}
      onOpenChange={useCallback(
        async (nextOpen, gesture) => {
          if (nextOpen) {
            setOpen(true)
            return
          }

          if (gesture === 'escape') {
            resetSelected()
            setOpen(false)
            return
          }

          handleSubmit()
        },
        [handleSubmit, resetSelected],
      )}
      overlayProps={useMemo(() => {
        return {
          sx: navItemOverlaySx,
        }
      }, [])}
      items={panelItems}
      selected={selected}
      renderAnchor={renderAnchor}
    />
  )
}
