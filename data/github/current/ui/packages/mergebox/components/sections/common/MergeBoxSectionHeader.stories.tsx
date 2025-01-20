import type {Meta} from '@storybook/react'
import {MergeBoxSectionHeader} from './MergeBoxSectionHeader'
import {CheckCircleFillIcon} from '@primer/octicons-react'
import {CircleOcticon} from '@primer/react'

const args = {
  title: 'Changes approved',
  icon: <CircleOcticon sx={{color: 'success.emphasis'}} icon={CheckCircleFillIcon} />,
  showExpand: true,
  expandableProps: {
    ariaLabel: 'Expand reviews',
    isExpanded: true,
    onToggle: () => alert('Clicked'),
  },
  children: '2 of 2 required reviews by reviewers with write access.',
}

const meta: Meta<typeof MergeBoxSectionHeader> = {
  title: 'Pull Requests/mergebox/MergeBoxSectionHeader',
  component: MergeBoxSectionHeader,
  argTypes: {
    icon: {
      description: 'The icon to be used for this section',
    },
    title: {
      description: 'The title of the section',
    },
    subtitle: {
      description: 'The subtitle of the section',
    },
    expandableProps: {
      description: 'Props to make the section expandable',
    },
    children: {
      description: 'Whatever is rendered under the title and subtitle',
    },
    rightSideContent: {
      description: 'Content to be rendered on the right side of the header instead of the expand toggle',
    },
  },
  decorators: [
    Story => (
      <div style={{maxWidth: '800px'}}>
        <Story />
      </div>
    ),
  ],
}

export default meta

export const Example = {args}
