import {useRef, useState} from 'react'
import {Button, Heading, Text} from '@primer/react'
import {GearIcon} from '@primer/octicons-react'
import {graphql, useFragment} from 'react-relay'
import {testIdProps} from '@github-ui/test-id-props'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import {ItemPickerLabels, type ItemPickerLabelsProps} from './ItemPickerLabels'
import {ItemPickerLabelsBoxItem} from './ItemPickerLabelsBoxItem'
import type {ItemPickerLabelsBox_SelectedLabelsFragment$key} from './__generated__/ItemPickerLabelsBox_SelectedLabelsFragment.graphql'

export type ItemPickerLabelsBoxProps = {
  selectedLabelsKey: ItemPickerLabelsBox_SelectedLabelsFragment$key | null
  sx?: BetterSystemStyleObject
} & Omit<ItemPickerLabelsProps, 'labelsButtonRef' | 'setOpen' | 'open' | 'selectedLabelsNames' | 'selectedLabelsKey'>

export function ItemPickerLabelsBox({selectedLabelsKey, ...props}: ItemPickerLabelsBoxProps) {
  const labelsButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const result = useFragment(
    graphql`
      fragment ItemPickerLabelsBox_SelectedLabelsFragment on LabelConnection
      @argumentDefinitions(
        withPath: {type: "Boolean!", defaultValue: false}
        withDate: {type: "Boolean!", defaultValue: false}
      ) {
        ...ItemPickerLabels_SelectedLabelsFragment @arguments(withPath: $withPath, withDate: $withDate)
        nodes {
          ...ItemPickerLabelsBoxItem_Fragment
        }
      }
    `,
    selectedLabelsKey,
  )

  // remove all null nodes in a TypeScript-friendly way
  const initialSelectedLabels = (result?.nodes || []).flatMap(a => (a ? a : []))

  return (
    <>
      <Button
        ref={labelsButtonRef}
        variant="invisible"
        size="small"
        trailingAction={GearIcon}
        block
        sx={{
          '[data-component=buttonContent]': {flex: '1 1 auto', justifyContent: 'left'},
          mb: 1,
        }}
        onClick={() => {
          setOpen(!open)
        }}
        {...testIdProps('item-picker-labels-box-edit-labels-button')}
      >
        <Heading as="h3" sx={{color: 'fg.muted', fontSize: 0}}>
          Labels
        </Heading>
        <span className="sr-only">Edit Labels</span>
      </Button>

      <div {...testIdProps('item-picker-labels-box-labels')}>
        {initialSelectedLabels.length > 0 ? (
          initialSelectedLabels.map((label, index) => <ItemPickerLabelsBoxItem key={index} labelKey={label} />)
        ) : (
          <Text sx={{color: 'fg.muted', px: 2}}>No Labels</Text>
        )}
      </div>

      <ItemPickerLabels
        {...props}
        open={open}
        selectedLabelsKey={result}
        setOpen={setOpen}
        labelsButtonRef={labelsButtonRef}
      />
    </>
  )
}
