import {SelectPanel, Button, Box} from '@primer/react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import React, {useCallback, useMemo, useState} from 'react'
import type {User} from '../types/user'
import {TriangleDownIcon} from '@primer/octicons-react'
import {useCampaignManagersQuery} from '../hooks/use-campaign-managers-query'

export type SecurityCampaignManagerSelectProps = {
  value: User | null
  onChange: (value: User | null) => void
  campaignManagersPath: string

  'aria-labelledby'?: string
}

export function SecurityCampaignManagerSelect({
  value,
  onChange,
  campaignManagersPath,
  'aria-labelledby': ariaLabelledBy,
}: SecurityCampaignManagerSelectProps) {
  const {data} = useCampaignManagersQuery(campaignManagersPath)

  const potentialManagers = useMemo(() => {
    const managers = [...(data?.managers ?? [])]

    if (value && !managers.some(manager => manager.id === value.id)) {
      managers.push(value)
    }

    return managers
  }, [data, value])

  const [filter, setFilter] = React.useState('')

  const items = useMemo(
    () =>
      potentialManagers.map(
        manager =>
          ({
            id: manager.id,
            text: manager.login,
            leadingVisual: () => <GitHubAvatar sx={{ml: '1px'}} size={16} src={manager.avatarUrl} alt="User avatar" />,
          }) satisfies ItemInput,
      ),
    [potentialManagers],
  )

  const filteredItems = items.filter(item => item.text.toLowerCase().startsWith(filter.toLowerCase()))

  const selectedItem = items.find(item => item.id === value?.id)

  const handleSelectedChange = useCallback(
    (newValue: ItemInput | undefined) => {
      if (newValue === undefined) {
        onChange(null)
        return
      }

      onChange(potentialManagers.find(manager => manager.id === newValue.id) ?? null)
    },
    [onChange, potentialManagers],
  )

  const [open, setOpen] = useState(false)
  return (
    <>
      <SelectPanel
        renderAnchor={({children, 'aria-labelledby': anchorAriaLabelledBy = ariaLabelledBy, ...anchorProps}) => (
          <Button trailingAction={TriangleDownIcon} aria-labelledby={anchorAriaLabelledBy} {...anchorProps}>
            {selectedItem ? (
              <Box sx={{display: 'flex', gap: '8px'}}>
                <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  {selectedItem.leadingVisual()}
                </Box>
                <Box sx={{display: 'flex', alignItems: 'baseline', flexGrow: 1}}>{children}</Box>
              </Box>
            ) : (
              'Select manager'
            )}
          </Button>
        )}
        placeholderText="Search for user"
        open={open}
        onOpenChange={setOpen}
        items={filteredItems}
        selected={selectedItem}
        onSelectedChange={handleSelectedChange}
        onFilterChange={setFilter}
        showItemDividers={true}
        overlayProps={{
          width: 'small',
          height: 'xsmall',
        }}
      />
    </>
  )
}
