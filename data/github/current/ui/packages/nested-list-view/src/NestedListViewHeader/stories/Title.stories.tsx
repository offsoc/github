import type {Meta, StoryObj} from '@storybook/react'

import {NestedListViewCompletionPill} from '../../CompletionPill'
import {NestedListView} from '../../NestedListView'
import {NestedListViewHeader} from '../NestedListViewHeader'
import {NestedListViewHeaderTitle, type NestedListViewHeaderTitleProps} from '../Title'

const meta = {
  title: 'Recipes/NestedListView/NestedListViewHeader/NestedListViewHeaderTitle',
  component: NestedListViewHeaderTitle,
} satisfies Meta<NestedListViewHeaderTitleProps>

export default meta

export const SimpleHeader: StoryObj<NestedListViewHeaderTitleProps> = {
  args: {
    title: 'Authored',
  },
  render: (titleProps: NestedListViewHeaderTitleProps) => {
    return (
      <NestedListView
        title="Nested list view title story"
        header={<NestedListViewHeader title={<NestedListViewHeaderTitle {...titleProps} />} />}
      />
    )
  },
}

export const SimpleHeaderWithCompletionPill: StoryObj<NestedListViewHeaderTitleProps> = {
  args: {
    title: 'Authored',
  },
  render: (titleProps: NestedListViewHeaderTitleProps) => {
    return (
      <NestedListView
        title="Nested list view title story"
        header={
          <NestedListViewHeader
            title={<NestedListViewHeaderTitle {...titleProps} />}
            completionPill={
              <NestedListViewCompletionPill
                progress={{
                  total: 11,
                  completed: 46,
                  percentCompleted: 24,
                }}
              />
            }
          />
        }
      />
    )
  },
}
