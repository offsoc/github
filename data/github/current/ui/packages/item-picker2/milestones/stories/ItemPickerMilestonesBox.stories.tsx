import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'
import {Box} from '@primer/react'

import {mockMilestonesResolvers} from '../__tests__/helper'
import {ItemPickerMilestonesBox, type ItemPickerMilestonesBoxProps} from '../ItemPickerMilestonesBox'

import type {ItemPickerMilestonesBoxStoryQuery} from './__generated__/ItemPickerMilestonesBoxStoryQuery.graphql'
import type {ItemPickerMilestonesList_Query} from '../__generated__/ItemPickerMilestonesList_Query.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerMilestonesBox',
  component: ItemPickerMilestonesBox,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
  },
} satisfies Meta<typeof ItemPickerMilestonesBox>

export default meta

const defaultArgs: Partial<ItemPickerMilestonesBoxProps> = {
  title: 'Apply a milestone to this issue',
}

type ItemPickerMilestonesBoxQueries = {
  rootQuery: ItemPickerMilestonesBoxStoryQuery
  listQuery: ItemPickerMilestonesList_Query
}

export const Example = {
  name: 'ItemPickerMilestonesBox',
  decorators: [
    relayDecorator<typeof ItemPickerMilestonesBox, ItemPickerMilestonesBoxQueries>,
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
        rootQuery: {
          type: 'fragment',
          query: graphql`
            query ItemPickerMilestonesBoxStoryQuery($owner: String!, $repo: String!, $number: Int!)
            @relay_test_operation {
              repository(owner: $owner, name: $repo) {
                issue(number: $number) {
                  milestone {
                    ...ItemPickerMilestonesBox_SelectedMilestonesFragment
                  }
                }
              }
            }
          `,
          variables: {owner: 'owner', repo: 'repo', number: 1},
        },
        listQuery: {
          type: 'lazy',
        },
      },
      mockResolvers: mockMilestonesResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedMilestonesKey: queryData.rootQuery.repository!.issue!.milestone,
          ...defaultArgs,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerMilestonesBox, ItemPickerMilestonesBoxQueries>
