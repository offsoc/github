import {TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Heading, IconButton} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {CustomerSelection} from '../../types/usage'

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  mb: 3,
}

const headingStyle = {
  mr: 2,
}

interface CostCenterSelectorProps {
  selections: CustomerSelection[]
  selectedCustomer: CustomerSelection
  setSelectedCustomer: (selectedCustomer: CustomerSelection) => void
  getHeadingText?: (selectedCustomer: CustomerSelection) => string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  containerSx?: BetterSystemStyleObject
  headingSx?: BetterSystemStyleObject
  title?: string
}

export default function CostCenterSelector({
  selections,
  selectedCustomer,
  setSelectedCustomer,
  getHeadingText,
  title,
  className,
  as,
  containerSx,
  headingSx,
}: CostCenterSelectorProps) {
  return (
    <Box sx={{...containerStyle, ...containerSx}} className={className}>
      {/* For some reason the double spread is required to get the Usage page overrides to stick */}
      <Heading as={as ?? 'h3'} sx={{...headingStyle, ...headingSx}}>
        {getHeadingText ? getHeadingText(selectedCustomer) : selectedCustomer.displayText}
      </Heading>
      {selections.length > 1 && (
        <ActionMenu>
          <ActionMenu.Anchor>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton unsafeDisableTooltip={true} icon={TriangleDownIcon} aria-label="Change cost center selection" />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList selectionVariant="single" showDividers>
              <ActionList.Group>
                <ActionList.GroupHeading>{title}</ActionList.GroupHeading>
                {selections.map(selection => {
                  return (
                    <ActionList.Item
                      key={selection.id}
                      onSelect={() => setSelectedCustomer(selection)}
                      selected={selection.id === selectedCustomer.id}
                      sx={{fontWeight: 'normal', whiteSpace: 'nowrap'}}
                    >
                      {selection.displayText}
                    </ActionList.Item>
                  )
                })}
              </ActionList.Group>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )}
    </Box>
  )
}
