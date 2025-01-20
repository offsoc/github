import useIsMounted from '@github-ui/use-is-mounted'
import {Spinner} from '@primer/react'
import type {GroupedListProps} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {SelectPanel} from '@primer/react/lib-esm/SelectPanel/SelectPanel'
import {memo, useCallback, useEffect, useRef, useState} from 'react'

import type {SupportedSuggestionOptions} from '../../../../helpers/suggestions'
import {useSelectPanel, type UseSelectPanelProps} from '../../../../hooks/editors/use-select-panel'
import {useApiRequest} from '../../../../hooks/use-api-request'
import {FieldValue} from './core'

type SidebarSelectPanelProps<T extends SupportedSuggestionOptions> = {
  placeholderText: string
  groupMetadata?: GroupedListProps['groupMetadata']
  displayValue: React.ReactNode
} & Omit<UseSelectPanelProps<T>, 'open' | 'onOpenChange' | 'renderAnchor' | 'overlayProps'>

function SidebarSelectPanelFunc<T extends SupportedSuggestionOptions>({
  displayValue,
  saveSelected,
  selected,
  ...useSelectPanelProps
}: SidebarSelectPanelProps<T>) {
  const [open, setOpen] = useState(false)
  const onOpenChange = useCallback((next: boolean) => setOpen(next), [])

  const [loading, setLoading] = useState(false)
  const requestFinishedRef = useRef(true)
  const isMounted = useIsMounted()

  const {perform: handleSave} = useApiRequest({
    request: async (_selected: Array<T>) => {
      setLoading(true)
      requestFinishedRef.current = false
      await saveSelected(_selected)
      requestFinishedRef.current = true
      setLoading(false)
    },
    rollback: () => {
      requestFinishedRef.current = true
      if (isMounted()) setLoading(false)
    },
  })

  // This is ugly, but we can't just setLoading(false) inside of request because we have to
  // wait until we get the updated value. Otherwise it will flash with the old value first.
  useEffect(() => {
    if (requestFinishedRef.current) setLoading(false)
  }, [selected])

  const selectPanelProps = useSelectPanel({
    ...useSelectPanelProps,
    open,
    onOpenChange,
    selected,
    renderAnchor: props => (
      <FieldValue interactable as="button" {...props}>
        {loading ? <Spinner size="small" /> : displayValue}
      </FieldValue>
    ),
    saveSelected: handleSave,
  })

  return (
    <SelectPanel
      {...selectPanelProps}
      overlayProps={{
        width: 'small',
        height: 'auto',
        maxHeight: 'large',
        ...selectPanelProps.overlayProps,
      }}
    />
  )
}

SidebarSelectPanelFunc.displayName = 'SidebarSelectPanelFunc'

export const SidebarSelectPanel = memo(SidebarSelectPanelFunc) as typeof SidebarSelectPanelFunc
