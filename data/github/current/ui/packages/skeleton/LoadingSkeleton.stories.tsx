import type {Meta} from '@storybook/react'
import {LoadingSkeleton, type LoadingSkeletonProps} from './LoadingSkeleton'

const meta = {
  title: 'Recipes/LoadingSkeleton',
  component: LoadingSkeleton,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof LoadingSkeleton>

export default meta

const defaultArgs: Partial<LoadingSkeletonProps> = {
  height: '20px',
  variant: 'rectangular',
  width: '200px',
}

export const SkeletonExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: LoadingSkeletonProps) => <LoadingSkeleton {...args} />,
}
