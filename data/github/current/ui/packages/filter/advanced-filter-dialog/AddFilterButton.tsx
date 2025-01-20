import {testIdProps} from '@github-ui/test-id-props'
import {PlusIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button, Octicon} from '@primer/react'
import {forwardRef, useState} from 'react'

import type {FilterProvider} from '../types'

interface AddFilterButtonProps {
  size: 'small' | 'medium' | 'large'
  filterProviders: FilterProvider[]
  addNewFilterBlock: (provider: FilterProvider) => void
}
export const AddFilterButton = forwardRef<HTMLButtonElement, AddFilterButtonProps>(
  ({size, filterProviders, addNewFilterBlock}, ref) => {
    const [addFilterMenuOpen, setAddFilterMenuOpen] = useState(false)

    return (
      <>
        <Button
          size={size}
          ref={ref as React.RefObject<HTMLButtonElement>}
          onClick={() => setAddFilterMenuOpen(!addFilterMenuOpen)}
          {...testIdProps('afd-add-filter')}
        >
          <Octicon icon={PlusIcon} sx={{mr: 1, color: 'fg.muted'}} />
          Add a filter
        </Button>
        <ActionMenu
          anchorRef={ref as React.RefObject<HTMLButtonElement>}
          open={addFilterMenuOpen}
          onOpenChange={setAddFilterMenuOpen}
        >
          <ActionMenu.Overlay sx={{width: 'fit-content', whiteSpace: 'nowrap'}}>
            <ActionList
              sx={{maxHeight: '320px', overflow: 'auto'}}
              {...testIdProps('afd-add-filter-options')}
              aria-label="Filter options"
            >
              {filterProviders.map(provider => {
                const {icon: Icon} = provider
                return (
                  <ActionList.Item
                    key={`advanced-filter-add-provider-${provider.key}`}
                    onSelect={() => addNewFilterBlock(provider)}
                    role="menuitem"
                    sx={{':focus:not(:focus-visible)': {outlineStyle: 'none'}}}
                  >
                    {Icon && (
                      <ActionList.LeadingVisual>
                        <Icon />
                      </ActionList.LeadingVisual>
                    )}
                    {provider.displayName ?? provider.key}
                  </ActionList.Item>
                )
              })}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </>
    )
  },
)

AddFilterButton.displayName = 'AddFilterButton'
