import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'
import {Box} from '@primer/react'

import {mockLabelsResolvers} from '../__tests__/helper'
import {ItemPickerLabelsBox, type ItemPickerLabelsBoxProps} from '../ItemPickerLabelsBox'

import type {ItemPickerLabelsBoxStoryQuery} from './__generated__/ItemPickerLabelsBoxStoryQuery.graphql'
import type {ItemPickerLabelsList_Query} from '../__generated__/ItemPickerLabelsList_Query.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerLabelsBox',
  component: ItemPickerLabelsBox,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
  },
} satisfies Meta<typeof ItemPickerLabelsBox>

export default meta

const defaultArgs: Partial<ItemPickerLabelsBoxProps> = {
  owner: 'github',
  repo: 'github',
  title: 'Apply labels to this issue',
  onCreateNewLabel: () => void 0,
}

type ItemPickerLabelsBoxQueries = {
  rootQuery: ItemPickerLabelsBoxStoryQuery
  listQuery: ItemPickerLabelsList_Query
}

export const Example = {
  name: 'ItemPickerLabelsBox',
  decorators: [
    relayDecorator<typeof ItemPickerLabelsBox, ItemPickerLabelsBoxQueries>,
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
            query ItemPickerLabelsBoxStoryQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
              repository(owner: $owner, name: $repo) {
                issue(number: $number) {
                  labels(first: 20) {
                    ...ItemPickerLabelsBox_SelectedLabelsFragment
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
      mockResolvers: mockLabelsResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedLabelsKey: queryData.rootQuery.repository!.issue!.labels!,
          ...defaultArgs,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerLabelsBox, ItemPickerLabelsBoxQueries>
