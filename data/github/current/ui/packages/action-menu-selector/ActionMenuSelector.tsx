import {ActionList, ActionMenu} from '@primer/react'
import type {ActionListProps, ActionMenuButtonProps, OverlayProps} from '@primer/react'

export type ActionMenuSelectorProps<ActionMenuSelectorType extends string | number> = {
  actionListProps?: ActionListProps
  buttonProps?: Omit<ActionMenuButtonProps, 'children'>
  overlayProps?: Partial<OverlayProps>
  currentSelection: ActionMenuSelectorType
  orderedValues: ActionMenuSelectorType[]
  displayValues: Record<ActionMenuSelectorType, string>
  onSelect: (selected: ActionMenuSelectorType) => void
}

export function ActionMenuSelector<ActionMenuSelectorType extends string | number>({
  buttonProps,
  overlayProps,
  actionListProps,
  currentSelection,
  orderedValues,
  displayValues,
  onSelect,
}: ActionMenuSelectorProps<ActionMenuSelectorType>) {
  return (
    <ActionMenu>
      <ActionMenu.Button size="medium" {...buttonProps}>
        {displayValues[currentSelection]}
      </ActionMenu.Button>
      <ActionMenu.Overlay width="medium" {...overlayProps}>
        <ActionList selectionVariant="single" {...actionListProps}>
          {orderedValues.map(option => (
            <ActionList.Item
              key={option}
              selected={option === currentSelection}
              onSelect={() => {
                onSelect(option)
              }}
            >
              {displayValues[option]}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
