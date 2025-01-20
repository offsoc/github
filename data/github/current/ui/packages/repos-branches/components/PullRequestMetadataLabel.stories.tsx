import type {Meta, StoryObj} from '@storybook/react'
import PullRequestMetadataLabel from './PullRequestMetadataLabel'
import {PullRequestStatus} from '../types'

const meta: Meta<typeof PullRequestMetadataLabel> = {
  title: 'Repo Branches/Components/PullRequestMetadataLabel',
  component: PullRequestMetadataLabel,
  argTypes: {
    status: {
      if: {arg: 'kind', eq: 'pull-request'},
      control: {type: 'radio'},
      options: Object.keys(PullRequestStatus),
    },
    number: {
      if: {arg: 'kind', eq: 'pull-request'},
    },
    queueCount: {
      if: {arg: 'kind', eq: 'merge-queue'},
    },
  },
}

export const Default: StoryObj<typeof PullRequestMetadataLabel> = {
  args: {
    status: PullRequestStatus.Open,
    number: 12345,
    kind: 'pull-request',
  },
  render: args => {
    return <PullRequestMetadataLabel {...args} />
  },
}

export default meta
