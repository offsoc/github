import {Button} from '@primer/react'
import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {useEffect, useRef, useState} from 'react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import type {LazyQueryOptions} from '@github-ui/relay-test-utils/RelayTestFactories'

import {MockLabel} from '../__tests__/helper'
import type {SubmittedLabel} from '../types'
import {ItemPickerLabelsNames, type ItemPickerLabelsNamesProps} from '../ItemPickerLabelsNames'

import type {ItemPickerLabelsNames_Query} from '../__generated__/ItemPickerLabelsNames_Query.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerLabelsNames',
  component: Example,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
    preloadLabelsList: {control: 'boolean'},
    fetchLabelsWithPath: {control: 'boolean'},
    fetchLabelsWithDate: {control: 'boolean'},
    maxSelectableItems: {control: 'number'},
    selectionVariant: {control: 'select', options: ['instant', 'single', 'multiple']},
  },
} satisfies Meta<typeof ItemPickerLabelsNames>

export default meta

const defaultArgs: Partial<ItemPickerLabelsNamesProps> = {
  title: 'Apply labels to this issue',
  onCreateNewLabel: () => void 0,
  selectedLabelsNames: ['label 0'],
}

function InnerComponent() {
  useEffect(() => {
    throw new Error('Intentional error in InnerComponent')
  })

  return <span />
}

function Example(props: ItemPickerLabelsNamesProps) {
  const labelsButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(false)
  const {id, ...additionalInfo} = MockLabel(0)
  const [storySelectedLabels, setStorySelectedLabels] = useState<SubmittedLabel[]>([{id, additionalInfo}])

  return (
    <>
      <Button
        ref={labelsButtonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        Edit Button
      </Button>

      <ItemPickerLabelsNames
        {...props}
        labelsButtonRef={labelsButtonRef}
        open={open}
        setOpen={setOpen}
        onSubmit={setStorySelectedLabels}
        owner="github"
        repo="github"
      />

      <hr />

      <pre>
        <code>{JSON.stringify(storySelectedLabels, null, 2)}</code>
      </pre>
    </>
  )
}

type ItemPickerLabelsTestQueries = {
  listQuery: ItemPickerLabelsNames_Query
}

const queries: {
  listQuery: LazyQueryOptions
} = {
  listQuery: {
    type: 'lazy',
  },
}

export const ErrorMessageFull = {
  name: 'Full Panel Error',
  decorators: [
    Story => (
      <>
        <p>
          If you are coming from another Item Picker Labels story, please refresh the page to see the loading skeleton
        </p>
        <Story />
      </>
    ),
    relayDecorator<typeof ItemPickerLabelsNames, ItemPickerLabelsTestQueries>,
  ],
  parameters: {
    relay: {
      environment,
      queries,
      mapStoryArgs: () => ({...defaultArgs, children: <InnerComponent />}),
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerLabelsNames, ItemPickerLabelsTestQueries>
