import {type FC, useCallback, useState} from 'react'

import {Button, SelectPanel} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {TriangleDownIcon} from '@primer/octicons-react'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList'
import type {OrganizationRecord} from '../../types/settings-types'

type SelectPanelCallback = (param: ItemInput[] | ItemInput | undefined) => void

type OrganizationSelectProps = {
  orgLogin?: string | null /// The org login to pre-select
  organizations: OrganizationRecord[] /// The list of organizations to select from
  open?: boolean /// Whether the dropdown starts open

  onChange?: (orgLogin: string) => void /// Callback when organization is selected
}

const OrganizationSelect: FC<OrganizationSelectProps> = ({orgLogin, organizations, onChange, open}) => {
  const [selectedOrgLogin, setSelectedOrgLogin] = useState<string | null>(orgLogin || null)
  const [isOpen, setOpen] = useState<boolean>(open ?? false)
  const [filter, setFilter] = useState<string>('')

  const items = organizations.map(org => ({
    leadingVisual: () => (
      <>
        <img width={16} height={16} src={org.avatarUrl} alt={org.login} />
      </>
    ),
    text: org.login,
    id: org.login,
    selectionVariant: 'single',
    sx: {paddingLeft: '0'},
  })) as ItemProps[]
  const filteredItems = items.filter(item => item.text?.toLowerCase()?.includes(filter.toLowerCase()))

  const selectCallback: SelectPanelCallback = param => {
    if (param === undefined) {
      return
    }

    // We only allow one organization to be selected at a time
    const selectedItemInputs = Array.isArray(param) ? param : [param]
    const selectedItem = selectedItemInputs[0]!

    // Handle selected item (if we have a callback and item value)
    setOpen(false)
    selectedItem && selectedItem.text && onChange && onChange(selectedItem.text)
    setSelectedOrgLogin(selectedItem.text || null)
  }
  const onSelect = useCallback(selectCallback, [selectCallback])
  const onFilter = useCallback(setFilter, [setFilter])
  const onOpen = useCallback(() => setOpen(!isOpen), [isOpen, setOpen])

  return (
    <SelectPanel
      renderAnchor={({children, ...anchorProps}) => (
        <Button trailingVisual={TriangleDownIcon} {...anchorProps}>
          {children || 'Pick organization'}
        </Button>
      )}
      placeholderText="Search organizations"
      items={filteredItems}
      selected={items.find(item => item.id === selectedOrgLogin)}
      onSelectedChange={onSelect}
      onOpenChange={onOpen}
      onFilterChange={onFilter}
      open={isOpen}
      overlayProps={{width: 'small', height: filteredItems.length > 6 ? 'small' : 'auto'}}
    />
  )
}

export default OrganizationSelect
