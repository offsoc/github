import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'
import type {LazyQueryOptions, QueryOptions} from '@github-ui/relay-test-utils/RelayTestFactories'
import {Box} from '@primer/react'

import type {
  ItemPickerRepositoryAssignableUsersProps,
  ItemPickerRepositoryAssignableUsers,
} from '../ItemPickerRepositoryAssignableUsers'
import {ItemPickerRepositoryAssignableUsersBox} from '../ItemPickerRepositoryAssignableUsersBox'

import type {ItemPickerRepositoryAssignableUsersBoxStoryQuery} from './__generated__/ItemPickerRepositoryAssignableUsersBoxStoryQuery.graphql'
import type {ItemPickerRepositoryAssignableUsersList_Query} from '../__generated__/ItemPickerRepositoryAssignableUsersList_Query.graphql'
import {MockUser, mockRepositoryAssignableUsersResolvers} from '../__tests__/helper'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerRepositoryAssignableUsersBox',
  component: ItemPickerRepositoryAssignableUsersBox,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof ItemPickerRepositoryAssignableUsersBox>

export default meta

const defaultArgs: Partial<ItemPickerRepositoryAssignableUsersProps> = {
  title: 'Apply Assignees to this new issue',
}

type ItemPickerRepositoryAssignableUsersTestQueries = {
  rootQuery: ItemPickerRepositoryAssignableUsersBoxStoryQuery
  listQuery: ItemPickerRepositoryAssignableUsersList_Query
}

const queries: {
  rootQuery: QueryOptions<ItemPickerRepositoryAssignableUsersBoxStoryQuery>
  listQuery: LazyQueryOptions
} = {
  rootQuery: {
    type: 'fragment',
    query: graphql`
      query ItemPickerRepositoryAssignableUsersBoxStoryQuery(
        $owner: String!
        $repo: String!
        $assignedUserLogins: String!
      ) @relay_test_operation {
        repository(owner: $owner, name: $repo) {
          assignableUsers(first: 10, loginNames: $assignedUserLogins) {
            ...ItemPickerRepositoryAssignableUsersBox_SelectedAssigneesFragment
          }
        }
      }
    `,
    variables: {owner: 'owner', repo: 'repo', assignedUserLogins: MockUser(0).login},
  },
  listQuery: {
    type: 'lazy',
  },
}

export const Example = {
  name: 'ItemPickerRepositoryAssignableUsersBox',
  decorators: [
    relayDecorator<typeof ItemPickerRepositoryAssignableUsersBox, ItemPickerRepositoryAssignableUsersTestQueries>,
    Story => (
      <Box sx={{width: '317px', border: '2px solid black'}}>
        <Story />
      </Box>
    ),
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
