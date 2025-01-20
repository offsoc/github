import type {Meta, StoryObj} from '@storybook/react'

import {SkeletonText} from '../Skeleton'

const meta = {
  title: 'Apps/Code View Shared/SkeletonText',
  component: SkeletonText,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof SkeletonText>

export default meta

const defaultArgs = {
  width: 200,
}

type Story = StoryObj<typeof SkeletonText>

export const Default: Story = {
  render: () => <SkeletonText width={defaultArgs.width} />,
}
