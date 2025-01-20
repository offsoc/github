import {Button} from '@primer/react'
import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {useRef, useState} from 'react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'
import type {LazyQueryOptions, QueryOptions} from '@github-ui/relay-test-utils/RelayTestFactories'

import {MockUser, mockRepositoryAssignableUsersResolvers} from '../__tests__/helper'
import type {SubmittedAssignee} from '../types'
import type {ItemPickerRepositoryAssignableUsersProps} from '../ItemPickerRepositoryAssignableUsers'
import {ItemPickerRepositoryAssignableUsers} from '../ItemPickerRepositoryAssignableUsers'

import type {ItemPickerRepositoryAssignableUsersStoryQuery as ItemPickerRepositoryAssignableUsersStoryQueryType} from './__generated__/ItemPickerRepositoryAssignableUsersStoryQuery.graphql'
import type {ItemPickerRepositoryAssignableUsersList_Query} from '../__generated__/ItemPickerRepositoryAssignableUsersList_Query.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerRepositoryAssignableUsers',
  component: Example,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
    maxSelectableItems: {control: 'number'},
    selectionVariant: {control: 'select', options: ['instant', 'single', 'multiple']},
  },
} satisfies Meta<typeof ItemPickerRepositoryAssignableUsers>

export default meta

const defaultArgs: Partial<ItemPickerRepositoryAssignableUsersProps> = {
  title: 'Apply Assignees to this new issue',
}

function Example(props: ItemPickerRepositoryAssignableUsersProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(false)
  const {id, ...additionalInfo} = MockUser(0)
  const [storySelectedAssignees, setStorySelectedAssignees] = useState<SubmittedAssignee[]>([{id, additionalInfo}])

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        Assignees
      </Button>

      <ItemPickerRepositoryAssignableUsers
        {...props}
        assigneesButtonRef={buttonRef}
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

type ItemPickerRepositoryAssignableUsersTestQueries = {
  rootQuery: ItemPickerRepositoryAssignableUsersStoryQueryType
  listQuery: ItemPickerRepositoryAssignableUsersList_Query
}

const itemPickerRepositoryAssignableUsersStoryQuery = graphql`
  query ItemPickerRepositoryAssignableUsersStoryQuery($owner: String!, $repo: String!, $assignedUserLogins: String!)
  @relay_test_operation {
    repository(owner: $owner, name: $repo) {
      assignableUsers(first: 10, loginNames: $assignedUserLogins) {
        ...ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment
      }
    }
  }
`

const queries: {
  rootQuery: QueryOptions<ItemPickerRepositoryAssignableUsersStoryQueryType>
  listQuery: LazyQueryOptions
} = {
  rootQuery: {
    type: 'fragment',
    query: itemPickerRepositoryAssignableUsersStoryQuery,
    variables: {owner: 'owner', repo: 'repo', assignedUserLogins: MockUser(0).login},
  },
  listQuery: {
    type: 'lazy',
  },
}

export const Playground = {
  decorators: [
    relayDecorator<typeof ItemPickerRepositoryAssignableUsers, ItemPickerRepositoryAssignableUsersTestQueries>,
  ],
  parameters: {
    relay: {
      environment,
      queries,
      mockResolvers: mockRepositoryAssignableUsersResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedAssigneesKey: queryData.rootQuery.repository!.assignableUsers,
          ...defaultArgs,
        } as ItemPickerRepositoryAssignableUsersProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerRepositoryAssignableUsers, ItemPickerRepositoryAssignableUsersTestQueries>

export const Loading = {
  decorators: [
    Story => (
      <>
        <p>
          If you are coming from another Item Picker RepositoryAssignableUsers story, please refresh the page to see the
          loading skeleton
        </p>
        <Story />
      </>
    ),
    relayDecorator<
      typeof ItemPickerRepositoryAssignableUsers,
      {rootQuery: ItemPickerRepositoryAssignableUsersStoryQueryType}
    >,
  ],
  parameters: {
    relay: {
      environment,
      queries: {
        rootQuery: {
          type: 'fragment',
          query: itemPickerRepositoryAssignableUsersStoryQuery,
          variables: {owner: 'owner', repo: 'repo', assignedUserLogins: MockUser(0).login},
        },
      },
      mockResolvers: mockRepositoryAssignableUsersResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedAssigneesKey: queryData.rootQuery.repository!.assignableUsers,
          ...defaultArgs,
        } as ItemPickerRepositoryAssignableUsersProps
      },
    },
  },
} satisfies RelayStoryObj<
  typeof ItemPickerRepositoryAssignableUsers,
  {
    rootQuery: ItemPickerRepositoryAssignableUsersStoryQueryType
  }
>
