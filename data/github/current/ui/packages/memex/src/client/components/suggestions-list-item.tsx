import {testIdProps} from '@github-ui/test-id-props'
import {ActionList} from '@primer/react'

import {SanitizedHtml} from './dom/sanitized-html'

export interface SuggestionsListItemProps {
  renderItem?: () => JSX.Element
  value: string
  asHTML: boolean
  selected: boolean
  onSelect: () => void
  selectedItemRef: React.RefObject<HTMLLIElement> | null
  testId: string
  id: string
}

export const SuggestionsListItem: React.FC<SuggestionsListItemProps> = (props: SuggestionsListItemProps) => {
  const computedProps = {
    ref: props.selectedItemRef,
    onSelect: props.onSelect,
    id: props.id,
    'aria-selected': props.selected,
    active: props.selected,
    tabIndex: -1,
    ...testIdProps(props.testId),
  }

  if (props.renderItem) {
    return (
      <ActionList.Item role="option" {...computedProps}>
        {props.renderItem()}
      </ActionList.Item>
    )
  }

  if (props.asHTML) {
    return (
      <ActionList.Item role="option" {...computedProps}>
        <SanitizedHtml>{props.value}</SanitizedHtml>
      </ActionList.Item>
    )
  } else {
    return (
      <ActionList.Item role="option" {...computedProps}>
        {props.value}
      </ActionList.Item>
    )
  }
}

SuggestionsListItem.displayName = 'SuggestionsListItem'
