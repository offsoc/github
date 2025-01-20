import type {Meta, StoryObj} from '@storybook/react'

import type {AnnotationIconProps} from './AnnotationIcon'
import {AnnotationIcon} from './AnnotationIcon'

const meta: Meta<typeof AnnotationIcon> = {
  title: 'Apps/React Shared/Conversations/AnnotationIcon',
  component: AnnotationIcon,
}

type Story = StoryObj<typeof AnnotationIcon>

export const Story = {
  argTypes: {
    annotationLevel: {options: ['FAILURE', 'WARNING', 'NOTICE']},
  },
  args: {
    annotationLevel: 'FAILURE',
  },
  render: (args: AnnotationIconProps) => <AnnotationIcon {...args} />,
}

export default meta
