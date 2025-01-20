import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'
import {Box} from '@primer/react'

import {mockProjectsResolvers} from '../__tests__/helper'
import {ItemPickerProjectsBox, type ItemPickerProjectsBoxProps} from '../ItemPickerProjectsBox'

import type {ItemPickerProjectsBoxStoryQuery} from './__generated__/ItemPickerProjectsBoxStoryQuery.graphql'
import type {ItemPickerProjectsList_Query} from '../__generated__/ItemPickerProjectsList_Query.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerProjectsBox',
  component: ItemPickerProjectsBox,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
  },
} satisfies Meta<typeof ItemPickerProjectsBox>

export default meta

const defaultArgs: Partial<ItemPickerProjectsBoxProps> = {
  title: 'Apply projects to this issue',
  includeClassicProjects: true,
}

type ItemPickerProjectsBoxQueries = {
  itemPickerProjectBoxSelectedQuery: ItemPickerProjectsBoxStoryQuery
  ItemPickerProjectsList_Query: ItemPickerProjectsList_Query
}

export const Example = {
  name: 'ItemPickerProjectsBox',
  decorators: [
    relayDecorator<typeof ItemPickerProjectsBox, ItemPickerProjectsBoxQueries>,
    Story => (
      <Box sx={{width: '317px', border: '2px solid black'}}>
        <Story />
      </Box>
    ),
  ],
  parameters: {
    relay: {
      environment,
      queries: {
        itemPickerProjectBoxSelectedQuery: {
          type: 'fragment',
          query: graphql`
            query ItemPickerProjectsBoxStoryQuery($owner: String!, $repo: String!, $number: Int!)
            @relay_test_operation {
              repository(owner: $owner, name: $repo) {
                issue(number: $number) {
                  projectsV2(first: 10) {
                    ...ItemPickerProjectsBox_SelectedProjectsV2Fragment
                  }
                  projectCards(first: 10) {
                    ...ItemPickerProjectsBox_SelectedClassicProjectCardsFragment
                  }
                }
              }
            }
          `,
          variables: {owner: 'owner', repo: 'repo', number: 1},
        },
        ItemPickerProjectsList_Query: {
          type: 'lazy',
        },
      },
      mockResolvers: mockProjectsResolvers(),
      mapStoryArgs: ({queryData}) => {
        const issue = queryData.itemPickerProjectBoxSelectedQuery.repository?.issue
        return {
          selectedProjectsV2Key: issue?.projectsV2,
          selectedClassicProjectCardsKey: issue?.projectCards,
          ...defaultArgs,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerProjectsBox, ItemPickerProjectsBoxQueries>
