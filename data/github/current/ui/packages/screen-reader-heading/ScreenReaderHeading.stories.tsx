import type {Meta} from '@storybook/react'
import {ScreenReaderHeading, type ScreenReaderHeadingProps} from './ScreenReaderHeading'

const meta = {
  title: 'Recipes/ScreenReaderHeading',
  component: ScreenReaderHeading,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    text: {control: 'text', defaultValue: 'Hello, Storybook!'},
    as: {control: 'text', defaultValue: 'h2'},
  },
} satisfies Meta<typeof ScreenReaderHeading>

export default meta

const defaultArgs: Partial<ScreenReaderHeadingProps> = {
  text: 'Hello, Storybook!',
}

export const ScreenReaderHeadingExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: ScreenReaderHeadingProps) => <ScreenReaderHeading {...args} />,
}
