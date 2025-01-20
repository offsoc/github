import {Box, IssueLabelToken} from '@primer/react'
import {graphql, useFragment} from 'react-relay'
import type {ItemPickerLabelsBoxItem_Fragment$key} from './__generated__/ItemPickerLabelsBoxItem_Fragment.graphql'

export function ItemPickerLabelsBoxItem({labelKey}: {labelKey: ItemPickerLabelsBoxItem_Fragment$key}) {
  const label = useFragment(
    graphql`
      fragment ItemPickerLabelsBoxItem_Fragment on Label {
        nameHTML
        color
        url
      }
    `,
    labelKey,
  )

  return (
    <Box sx={{'a:hover': {textDecoration: 'none'}}}>
      <IssueLabelToken as="a" fillColor={`#${label?.color}`} text={label?.nameHTML} href={label.url} />
    </Box>
  )
}
