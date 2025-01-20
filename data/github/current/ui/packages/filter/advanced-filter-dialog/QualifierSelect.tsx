import {TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button, Octicon, Text} from '@primer/react'

import type {FilterProvider, MutableFilterBlock} from '../types'
import {isMutableFilterBlock} from '../utils'

const qualifierButtonSx = {
  justifyContent: 'space-between',
  display: 'inline-flex',
  bg: 'canvas.default',
  boxShadow: 'unset',
  fontSize: 0,
  alignContent: 'start',
  textAlign: 'left',
  minWidth: '0',
  minHeight: [32, 32, 28],
  width: ['auto', 'auto', '100%'],
  '> span': {
    gap: '2px',
    gridTemplateColumns: 'min-content minmax(0,1fr) min-content',
    flex: 1,
    'span[data-component="text"]': {
      display: 'block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}

interface QualifierSelectProps {
  filterBlock: MutableFilterBlock
  index: number
  filterProviders: FilterProvider[]
  setFilterProvider: (qualifier: FilterProvider) => void
}

export const QualifierSelect = ({filterBlock, filterProviders, index, setFilterProvider}: QualifierSelectProps) => {
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <Button
          id={`afd-row-${index}-qualifier`}
          aria-label={`Qualifier ${index + 1}`}
          className="advanced-filter-item-qualifier"
          size="small"
          leadingVisual={() =>
            filterBlock?.provider?.icon ? <Octicon icon={filterBlock?.provider?.icon} sx={{color: 'fg.muted'}} /> : null
          }
          trailingVisual={() => <Octicon icon={TriangleDownIcon} sx={{color: 'fg.muted'}} />}
          sx={qualifierButtonSx}
        >
          {!isMutableFilterBlock(filterBlock)
            ? Text
            : filterBlock?.provider?.displayName ?? filterBlock?.provider?.key ?? 'Select a filter'}
        </Button>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay sx={{width: 'fit-content', whiteSpace: 'nowrap'}}>
        <ActionList selectionVariant="single" sx={{maxHeight: '320px', overflow: 'auto'}}>
          {filterProviders.map((provider, id) => {
            const {icon: Icon} = provider
            return (
              <ActionList.Item
                key={`advanced-filter-item-${filterBlock.id}-provider-${provider.key}-${id}`}
                onSelect={() => setFilterProvider(provider)}
                selected={provider.key === filterBlock.provider?.key}
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
  )
}
