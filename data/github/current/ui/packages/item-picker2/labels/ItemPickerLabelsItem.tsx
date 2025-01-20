import {graphql, readInlineData} from 'react-relay'
import {ActionListItemLabel} from '@github-ui/action-list-items/ActionListItemLabel'
import type {SafeHTMLString} from '@github-ui/safe-html'
import type {SubmittedLabel} from './types'
import {useItemPickerLabelsGraphQLVariables} from './GraphQLVariablesContext'
import type {
  ItemPickerLabelsItem_Fragment$data,
  ItemPickerLabelsItem_Fragment$key,
} from './__generated__/ItemPickerLabelsItem_Fragment.graphql'
import type {ItemPickerLabelsItem_PathFragment$data} from './__generated__/ItemPickerLabelsItem_PathFragment.graphql'
import type {ItemPickerLabelsItem_DateFragment$data} from './__generated__/ItemPickerLabelsItem_DateFragment.graphql'

type AdditionalDataOptions = {withPath: boolean; withDate: boolean}

export type ItemPickerLabelsItem = {
  labelItem: ItemPickerLabelsItem_Fragment$key
  onItemSelect: (id: string, additionalInfo: SubmittedLabel['additionalInfo']) => void
  selected: boolean
  selectType: 'multiple' | 'instant' | 'single'
  uniqueListId: string
  disabled?: boolean
}

export const ItemPickerLabelsItem_Fragment = graphql`
  fragment ItemPickerLabelsItem_Fragment on Label
  # Use inline directive to access data on initial selected labels
  # https://relay.dev/docs/api-reference/graphql-and-directives/#inline
  @inline
  @argumentDefinitions(
    withPath: {type: "Boolean!", defaultValue: false}
    withDate: {type: "Boolean!", defaultValue: false}
  ) {
    name
    nameHTML
    color
    id
    description
    ...ItemPickerLabelsItem_PathFragment @include(if: $withPath)
    ...ItemPickerLabelsItem_DateFragment @include(if: $withDate)
  }
`

// We disable these fields because they are optionally returned to the consumer
// as additional data and not used for rendering
const ItemPickerLabelsItem_PathFragment = graphql`
  fragment ItemPickerLabelsItem_PathFragment on Label @inline {
    # eslint-disable-next-line relay/unused-fields
    url
    # eslint-disable-next-line relay/unused-fields
    resourcePath
  }
`

const ItemPickerLabelsItem_DateFragment = graphql`
  fragment ItemPickerLabelsItem_DateFragment on Label @inline {
    # eslint-disable-next-line relay/unused-fields
    createdAt
    # eslint-disable-next-line relay/unused-fields
    updatedAt
  }
`

export const readInlineAdditionalData = (
  itemFragmentKey: ItemPickerLabelsItem_Fragment$data,
  options: AdditionalDataOptions,
) => {
  const paths = options.withPath
    ? // eslint-disable-next-line no-restricted-syntax
      (readInlineData(ItemPickerLabelsItem_PathFragment, itemFragmentKey) as ItemPickerLabelsItem_PathFragment$data)
    : {}

  const dates = options.withDate
    ? // eslint-disable-next-line no-restricted-syntax
      (readInlineData(ItemPickerLabelsItem_DateFragment, itemFragmentKey) as ItemPickerLabelsItem_DateFragment$data)
    : {}
  const {name, nameHTML, color, description} = itemFragmentKey
  return {
    name,
    nameHTML,
    color,
    description,
    ...paths,
    ...dates,
  }
}

export function ItemPickerLabelsItem({
  labelItem,
  onItemSelect,
  selected,
  selectType,
  uniqueListId,
  ...props
}: ItemPickerLabelsItem) {
  const {withPath, withDate} = useItemPickerLabelsGraphQLVariables()
  // eslint-disable-next-line no-restricted-syntax
  const item = readInlineData(ItemPickerLabelsItem_Fragment, labelItem)
  const {name, nameHTML, id, color, description} = item

  const onSelect = () => {
    const additionalData = readInlineAdditionalData(item, {withPath, withDate})
    onItemSelect(id, additionalData)
  }

  const typeSpecificProps =
    selectType === 'multiple' || selectType === 'instant' ? {selectType} : {selectType, radioGroupName: uniqueListId}

  return (
    <ActionListItemLabel
      id={id}
      description={description || undefined}
      hexColor={color}
      name={name}
      nameHTML={nameHTML as SafeHTMLString}
      onSelect={onSelect}
      selected={selected}
      {...typeSpecificProps}
      {...props}
    />
  )
}
