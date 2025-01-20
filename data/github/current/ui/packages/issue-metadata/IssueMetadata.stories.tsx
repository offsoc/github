import type {Meta} from '@storybook/react'
import {IssueMetadata, type IssueMetadataProps} from './IssueMetadata'

const meta = {
  title: 'IssuesComponents/IssueMetadata',
  component: IssueMetadata,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    exampleMessage: {control: 'text', defaultValue: 'Hello, Storybook!'},
  },
} satisfies Meta<typeof IssueMetadata>

export default meta

const defaultArgs: Partial<IssueMetadataProps> = {
  exampleMessage: 'Hello, Storybook!',
}

export const IssueMetadataExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: IssueMetadataProps) => <IssueMetadata {...args} />,
}
