import {Button} from '@primer/react'
import {SelectPanel} from '@primer/react/drafts'
import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {useRef, useState} from 'react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'
import type {LazyQueryOptions, QueryOptions} from '@github-ui/relay-test-utils/RelayTestFactories'

import {ItemPickerLabels, type ItemPickerLabelsProps} from '../../labels/ItemPickerLabels'
import {MockLabel, mockLabelsResolvers} from '../../labels/__tests__/helper'
import type {SubmittedLabel} from '../../labels/types'
import type {ItemPickerLabelsList_Query} from '../../labels/__generated__/ItemPickerLabelsList_Query.graphql'
import type {SelectPanelFeaturesStoryQuery} from './__generated__/SelectPanelFeaturesStoryQuery.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/Common Features',
  component: Example,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
    fetchLabelsWithPath: {control: 'boolean'},
    fetchLabelsWithDate: {control: 'boolean'},
    maxSelectableItems: {control: 'number'},
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
  rootQuery: SelectPanelFeaturesStoryQuery
  listQuery: ItemPickerLabelsList_Query
}

const itemPickerLabelsStoryQuery = graphql`
  query SelectPanelFeaturesStoryQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
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
  rootQuery: QueryOptions<SelectPanelFeaturesStoryQuery>
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

const secondaryActionButton = <SelectPanel.SecondaryAction variant="button">Edit labels</SelectPanel.SecondaryAction>
const secondaryActionLink = <SelectPanel.SecondaryAction variant="link">View all labels</SelectPanel.SecondaryAction>

export const MultipleWithSecondaryAction = {
  name: 'Multiple-Select With Secondary Action',
  decorators: [relayDecorator<typeof ItemPickerLabels, ItemPickerLabelsTestQueries>],
  parameters: {
    relay: {
      environment,
      queries,
      mockResolvers: mockLabelsResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedLabelsKey: queryData.rootQuery.repository!.issue!.labels,
          secondaryActions: secondaryActionButton,
          ...defaultArgs,
        } as ItemPickerLabelsProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerLabels, ItemPickerLabelsTestQueries>

export const SingleWithSecondaryAction = {
  name: 'Single-Select With Secondary Action',
  decorators: [relayDecorator<typeof ItemPickerLabels, ItemPickerLabelsTestQueries>],
  parameters: {
    relay: {
      environment,
      queries,
      mockResolvers: mockLabelsResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedLabelsKey: queryData.rootQuery.repository!.issue!.labels,
          selectionVariant: 'instant',
          secondaryActions: secondaryActionLink,
          ...defaultArgs,
        } as ItemPickerLabelsProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerLabels, ItemPickerLabelsTestQueries>

export const Modal = {
  name: 'Modal',
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
          variant: 'modal',
        } as ItemPickerLabelsProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerLabels, ItemPickerLabelsTestQueries>
