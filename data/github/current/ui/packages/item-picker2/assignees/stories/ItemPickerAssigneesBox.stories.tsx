import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'
import {Box} from '@primer/react'

import {mockAssigneesResolvers} from '../__tests__/helper'
import {ItemPickerAssigneesBox, type ItemPickerAssigneesBoxProps} from '../ItemPickerAssigneesBox'

import type {ItemPickerAssigneesBoxStoryQuery} from './__generated__/ItemPickerAssigneesBoxStoryQuery.graphql'
import type {ItemPickerAssigneesList_Query} from '../__generated__/ItemPickerAssigneesList_Query.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerAssigneesBox',
  component: ItemPickerAssigneesBox,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
  },
} satisfies Meta<typeof ItemPickerAssigneesBox>

export default meta

const defaultArgs: Partial<ItemPickerAssigneesBoxProps> = {
  title: 'Apply labels to this issue',
}

type ItemPickerAssigneesBoxQueries = {
  itemPickerAssigneeBoxSelectedQuery: ItemPickerAssigneesBoxStoryQuery
  itemPickerAssigneesQuery: ItemPickerAssigneesList_Query
}

export const Example = {
  name: 'ItemPickerAssigneesBox',
  decorators: [
    relayDecorator<typeof ItemPickerAssigneesBox, ItemPickerAssigneesBoxQueries>,
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
        itemPickerAssigneeBoxSelectedQuery: {
          type: 'fragment',
          query: graphql`
            query ItemPickerAssigneesBoxStoryQuery($owner: String!, $repo: String!, $number: Int!)
            @relay_test_operation {
              viewer {
                # eslint-disable-next-line relay/must-colocate-fragment-spreads
                ...ItemPickerAssignees_CurrentViewerFragment
              }
              repository(owner: $owner, name: $repo) {
                issue(number: $number) {
                  ...ItemPickerAssigneesBox_SelectedAssigneesFragment
                }
              }
            }
          `,
          variables: {owner: 'owner', repo: 'repo', number: 1},
        },
        itemPickerAssigneesQuery: {
          type: 'lazy',
        },
      },
      mockResolvers: mockAssigneesResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedAssigneesKey: queryData.itemPickerAssigneeBoxSelectedQuery.repository!.issue!,
          currentViewerKey: queryData.itemPickerAssigneeBoxSelectedQuery.viewer,
          ...defaultArgs,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerAssigneesBox, ItemPickerAssigneesBoxQueries>
