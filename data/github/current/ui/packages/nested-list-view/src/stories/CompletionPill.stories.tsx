import type {Meta} from '@storybook/react'

import {NestedListViewCompletionPill, type NestedListViewCompletionPillProps} from '../CompletionPill'
import styles from './stories.module.css'

const meta: Meta<NestedListViewCompletionPillProps> = {
  title: 'Recipes/NestedListView/NestedListViewCompletionPill',
  component: NestedListViewCompletionPill,
  args: {
    progress: {
      total: 10,
      completed: 5,
      percentCompleted: 50,
    },
  },
  argTypes: {
    progress: {
      total: {
        control: 'number',
        step: 1,
        min: 1,
      },
      completed: {
        control: 'number',
        step: 1,
        min: 0,
      },
      percentCompleted: {
        control: 'number',
        step: 10,
        min: 0,
        max: 100,
      },
    },
  },
  decorators: [
    Story => (
      <div className={styles.completionPill}>
        <Story />
      </div>
    ),
  ],
}

export default meta

export const Example = {
  name: 'Playground',
  render: (args: NestedListViewCompletionPillProps) => {
    return <NestedListViewCompletionPill {...args} href="/foo" />
  },
}

export const Completed = {
  name: 'Completed',
  render: () => {
    return (
      <NestedListViewCompletionPill
        progress={{
          total: 10,
          completed: 10,
          percentCompleted: 100,
        }}
        href="/foo"
      />
    )
  },
}
