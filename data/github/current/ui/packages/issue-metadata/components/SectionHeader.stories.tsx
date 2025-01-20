import type {Meta} from '@storybook/react'
import {SectionHeader, type SectionHeaderProps} from './SectionHeader'

const meta = {
  title: 'IssuesComponents/IssueMetadata/Sections',
  component: SectionHeader,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof SectionHeader>

export default meta

const defaultArgs: Partial<SectionHeaderProps> = {
  title: 'Section title',
  readonly: true,
}

export const SectionHeaderExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: SectionHeaderProps) => <SectionHeader {...args} />,
}
