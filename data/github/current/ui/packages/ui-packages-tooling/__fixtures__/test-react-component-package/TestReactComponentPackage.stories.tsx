import type {Meta} from '@storybook/react'
import {TestReactComponentPackage, type TestReactComponentPackageProps} from './TestReactComponentPackage'

const meta = {
  title: 'Recipes/TestReactComponentPackage',
  component: TestReactComponentPackage,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    exampleMessage: {control: 'text', defaultValue: 'Hello, Storybook!'},
  },
} satisfies Meta<typeof TestReactComponentPackage>

export default meta

const defaultArgs: Partial<TestReactComponentPackageProps> = {
  exampleMessage: 'Hello, Storybook!',
}

export const TestReactComponentPackageExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: TestReactComponentPackageProps) => <TestReactComponentPackage {...args} />,
}
