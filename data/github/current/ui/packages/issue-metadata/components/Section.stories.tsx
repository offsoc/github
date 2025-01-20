import type {Meta} from '@storybook/react'
import {Section, type SectionProps} from './Section'

const meta = {
  title: 'IssuesComponents/IssueMetadata/Sections',
  component: Section,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof Section>

export default meta

const defaultArgs: Partial<SectionProps> = {
  emptyText: 'Empty text',
}

export const SectionExample = {
  args: {
    ...defaultArgs,
  },
}
