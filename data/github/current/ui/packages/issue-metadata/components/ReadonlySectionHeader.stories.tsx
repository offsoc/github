import type {Meta} from '@storybook/react'
import {ReadonlySectionHeader, type ReadonlySectionHeaderProps} from './ReadonlySectionHeader'

const meta = {
  title: 'IssuesComponents/IssueMetadata/Sections',
  component: ReadonlySectionHeader,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof ReadonlySectionHeader>

export default meta

const defaultArgs: Partial<ReadonlySectionHeaderProps> = {
  title: 'Section title',
}

export const ReadonlySectionHeaderExample = {
  args: {
    ...defaultArgs,
  },
}
