import {graphql} from 'relay-runtime'
import type {DiscussionCategoryPickerStoryQuery} from './__generated__/DiscussionCategoryPickerStoryQuery.graphql'
import {DiscussionCategoryPicker} from './DiscussionCategoryPicker'
import type {Meta} from '@storybook/react'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {buildDiscussionCategory} from '../test-utils/DiscussionCategoryPickerHelpers'
import {noop} from '@github-ui/noop'

type DiscussionCategoryPickerQueries = {
  storyQuery: DiscussionCategoryPickerStoryQuery
}

const meta: Meta<typeof DiscussionCategoryPicker> = {
  title: 'ItemPicker/DiscussionCategoryPicker',
  component: DiscussionCategoryPicker,
}

export default meta

export const Example = {
  decorators: [relayDecorator<typeof DiscussionCategoryPicker, DiscussionCategoryPickerQueries>],
  parameters: {
    relay: {
      queries: {
        storyQuery: {
          type: 'fragment',
          query: graphql`
            query DiscussionCategoryPickerStoryQuery($first: Int!, $repo: String!, $owner: String!)
            @relay_test_operation {
              repository(name: $repo, owner: $owner) {
                ...DiscussionCategoryPickerDiscussionCategories
              }
            }
          `,
          variables: {
            first: 0,
            owner: '',
            repo: '',
          },
        },
      },
      mockResolvers: {
        DiscussionCategoryConnection() {
          return {
            edges: [
              {node: buildDiscussionCategory({name: 'Announcements'})},
              {node: buildDiscussionCategory({name: 'General'})},
              {node: buildDiscussionCategory({name: 'Ideas'})},
            ],
          }
        },
      },
      mapStoryArgs: ({queryData}) => ({
        discussionCategoriesData: {
          ...queryData.storyQuery.repository!,
        },
        onSelect: noop,
      }),
    },
  },
} satisfies RelayStoryObj<typeof DiscussionCategoryPicker, DiscussionCategoryPickerQueries>
