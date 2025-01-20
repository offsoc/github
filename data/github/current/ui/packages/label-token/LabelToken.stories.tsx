import type {Meta} from '@storybook/react'
import {LabelToken, type LabelTokenProps} from './LabelToken'

const meta = {
  title: 'Recipes/Labels/LabelToken',
  component: LabelToken,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    text: {control: 'text', defaultValue: 'Hello, Storybook!'},
    fillColor: {control: 'text', defaultValue: '#8250df'},
    isSelected: {control: 'boolean', defaultValue: false},
    size: {control: 'radio', defaultValue: 'small', options: ['small', 'medium', 'large']},
  },
} satisfies Meta<typeof LabelToken>

export default meta

const defaultArgs: Partial<LabelTokenProps> = {
  text: 'Hello, Storybook!',
  fillColor: '#8250df',
}

export const LabelTokenExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: LabelTokenProps) => <LabelToken {...args} />,
}
