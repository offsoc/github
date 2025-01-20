import type React from 'react'

import {ActionList, ActionMenu, Box, Spinner} from '@primer/react'

export type ActionMenuButtonOption = {
  id: string
  title: React.ReactNode
  value: unknown
  description?: React.ReactNode
  selected?: boolean
  testId?: string
}

export function ActionMenuButton(props: {
  title: React.ReactNode
  options: ActionMenuButtonOption[]
  disabled: boolean
  loading?: boolean
  onSelect(option: ActionMenuButtonOption): void
  'data-testid'?: string
}) {
  return (
    <Box
      sx={{display: 'grid', gap: 2, alignItems: 'center', gridTemplateColumns: '1fr auto'}}
      data-testid={props['data-testid']}
    >
      {props.loading ? <Spinner size="small" /> : <Box as="span" sx={{width: '16px', height: '16px'}} />}
      <ActionMenu>
        <ActionMenu.Button disabled={props.disabled}>{props.title}</ActionMenu.Button>

        <ActionMenu.Overlay width="medium">
          <ActionList selectionVariant="single" showDividers>
            {props.options.map(option => {
              return (
                <ActionList.Item
                  key={option.id}
                  selected={option.selected}
                  onSelect={() => props.onSelect(option)}
                  data-testid={option.testId}
                >
                  {option.title}
                  {option.description && (
                    <ActionList.Description variant="block">{option.description}</ActionList.Description>
                  )}
                </ActionList.Item>
              )
            })}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Box>
  )
}
