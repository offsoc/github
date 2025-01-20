import {Button} from '@primer/react'
import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {useRef, useState} from 'react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'
import type {LazyQueryOptions, QueryOptions} from '@github-ui/relay-test-utils/RelayTestFactories'

import {MockLabel, mockLabelsResolvers} from '../__tests__/helper'
import type {SubmittedLabel} from '../types'
import type {ItemPickerLabelsProps} from '../ItemPickerLabels'
import {ItemPickerLabels} from '../ItemPickerLabels'

import type {ItemPickerLabelsStoryQuery as ItemPickerLabelsStoryQueryType} from './__generated__/ItemPickerLabelsStoryQuery.graphql'
import type {ItemPickerLabelsList_Query} from '../__generated__/ItemPickerLabelsList_Query.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerLabels',
  component: Example,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
    fetchLabelsWithPath: {control: 'boolean'},
    fetchLabelsWithDate: {control: 'boolean'},
    maxSelectableItems: {control: 'number'},
    selectionVariant: {control: 'select', options: ['instant', 'single', 'multiple']},
  },
} satisfies Meta<typeof ItemPickerLabels>

export default meta

const defaultArgs: Partial<ItemPickerLabelsProps> = {
  title: 'Apply labels to this issue',
  onCreateNewLabel: () => void 0,
}

function Example(props: ItemPickerLabelsProps) {
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

      <ItemPickerLabels
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
  rootQuery: ItemPickerLabelsStoryQueryType
  listQuery: ItemPickerLabelsList_Query
}

const itemPickerLabelsStoryQuery = graphql`
  query ItemPickerLabelsStoryQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        labels(first: 20) {
          ...ItemPickerLabels_SelectedLabelsFragment
        }
      }
    }
  }
`

const queries: {
  rootQuery: QueryOptions<ItemPickerLabelsStoryQueryType>
  listQuery: LazyQueryOptions
} = {
  rootQuery: {
    type: 'fragment',
    query: itemPickerLabelsStoryQuery,
    variables: {owner: 'owner', repo: 'repo', number: 1},
  },
  listQuery: {
    type: 'lazy',
  },
}

export const Playground = {
  decorators: [relayDecorator<typeof ItemPickerLabels, ItemPickerLabelsTestQueries>],
  parameters: {
    relay: {
      environment,
      queries,
      mockResolvers: mockLabelsResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedLabelsKey: queryData.rootQuery.repository!.issue!.labels,
          ...defaultArgs,
        } as ItemPickerLabelsProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerLabels, ItemPickerLabelsTestQueries>

export const Loading = {
  decorators: [
    Story => (
      <>
        <p>
          If you are coming from another Item Picker Labels story, please refresh the page to see the loading skeleton
        </p>
        <Story />
      </>
    ),
    relayDecorator<typeof ItemPickerLabels, {rootQuery: ItemPickerLabelsStoryQueryType}>,
  ],
  parameters: {
    relay: {
      environment,
      queries: {
        rootQuery: {
          type: 'fragment',
          query: itemPickerLabelsStoryQuery,
          variables: {owner: 'owner', repo: 'repo', number: 1},
        },
      },
      mockResolvers: mockLabelsResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedLabelsKey: queryData.rootQuery.repository!.issue!.labels,
          ...defaultArgs,
        } as ItemPickerLabelsProps
      },
    },
  },
} satisfies RelayStoryObj<
  typeof ItemPickerLabels,
  {
    rootQuery: ItemPickerLabelsStoryQueryType
  }
>
