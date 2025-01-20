import {Button} from '@primer/react'
import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {useRef, useState} from 'react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'
import type {LazyQueryOptions, QueryOptions} from '@github-ui/relay-test-utils/RelayTestFactories'

import {MockUser, mockAssigneesResolvers} from '../__tests__/helper'
import type {ItemPickerAssigneesProps} from '../ItemPickerAssignees'
import {ItemPickerAssignees} from '../ItemPickerAssignees'
import type {SubmittedAssignee} from '../types'

import type {ItemPickerAssigneesStoryQuery as ItemPickerAssigneesStoryQueryType} from './__generated__/ItemPickerAssigneesStoryQuery.graphql'
import type {ItemPickerAssigneesList_Query} from '../__generated__/ItemPickerAssigneesList_Query.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerAssignees',
  component: Example,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
    maxSelectableItems: {control: 'number'},
    selectionVariant: {control: 'select', options: ['instant', 'single', 'multiple']},
  },
} satisfies Meta<typeof ItemPickerAssignees>

export default meta

const defaultArgs: Partial<ItemPickerAssigneesProps> = {
  title: 'Set assignees',
}

function Example(props: ItemPickerAssigneesProps) {
  const assigneesButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(false)
  const {id, ...additionalInfo} = MockUser(0)
  const [storySelectedAssignees, setStorySelectedAssignees] = useState<SubmittedAssignee[]>([{id, additionalInfo}])

  return (
    <>
      <Button
        ref={assigneesButtonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        Edit Button
      </Button>

      <ItemPickerAssignees
        {...props}
        assigneesButtonRef={assigneesButtonRef}
        open={open}
        setOpen={setOpen}
        onSubmit={setStorySelectedAssignees}
      />

      <hr />

      <pre>
        <code>{JSON.stringify(storySelectedAssignees, null, 2)}</code>
      </pre>
    </>
  )
}

type ItemPickerAssigneesTestQueries = {
  rootQuery: ItemPickerAssigneesStoryQueryType
  listQuery: ItemPickerAssigneesList_Query
}

const itemPickerAssigneesStoryQuery = graphql`
  query ItemPickerAssigneesStoryQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
    viewer {
      ...ItemPickerAssignees_CurrentViewerFragment
    }
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        assignees(first: 20) {
          ...ItemPickerAssignees_SelectedAssigneesFragment
        }
      }
    }
  }
`

const queries: {
  rootQuery: QueryOptions<ItemPickerAssigneesStoryQueryType>
  listQuery: LazyQueryOptions
} = {
  rootQuery: {
    type: 'fragment',
    query: itemPickerAssigneesStoryQuery,
    variables: {owner: 'owner', repo: 'repo', number: 1},
  },
  listQuery: {
    type: 'lazy',
  },
}

export const Playground = {
  decorators: [relayDecorator<typeof ItemPickerAssignees, ItemPickerAssigneesTestQueries>],
  parameters: {
    relay: {
      environment,
      queries,
      mockResolvers: mockAssigneesResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedAssigneesKey: queryData.rootQuery.repository!.issue!.assignees,
          currentViewerKey: queryData.rootQuery.viewer,
          ...defaultArgs,
        } as ItemPickerAssigneesProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerAssignees, ItemPickerAssigneesTestQueries>

export const Loading = {
  decorators: [
    Story => (
      <>
        <p>
          If you are coming from another Item Picker Assignees story, please refresh the page to see the loading
          skeleton
        </p>
        <Story />
      </>
    ),
    relayDecorator<typeof ItemPickerAssignees, ItemPickerAssigneesTestQueries>,
  ],
  parameters: {
    relay: {
      environment,
      queries: {
        rootQuery: {
          type: 'fragment',
          query: itemPickerAssigneesStoryQuery,
          variables: {owner: 'owner', repo: 'repo', number: 1},
        },
      },
      mockResolvers: mockAssigneesResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedAssigneesKey: queryData.rootQuery.repository!.issue!.assignees,
          currentViewerKey: queryData.rootQuery.viewer,
          ...defaultArgs,
        } as ItemPickerAssigneesProps
      },
    },
  },
} satisfies RelayStoryObj<
  typeof ItemPickerAssignees,
  {
    rootQuery: ItemPickerAssigneesStoryQueryType
  }
>
