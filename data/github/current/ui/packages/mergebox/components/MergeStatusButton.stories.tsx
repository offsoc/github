import type {Meta, StoryObj} from '@storybook/react'
import {createRef} from 'react'
import {expect} from '@storybook/jest'
import {within} from '@storybook/test'

import {mockMergeRequirementsFromRelay} from '../test-utils/query-data'
import {MergeStatusButton} from './MergeStatusButton'
import type {MergeStatusButtonData} from '../types'

const defaultProps = {
  mergeStatusButtonRef: createRef<HTMLButtonElement>(),
  toggleMergeabilitySidesheet: () => {},
}

const mockPullRequest: Pick<MergeStatusButtonData, 'state' | 'isInMergeQueue' | 'isDraft' | 'viewerDidAuthor'> = {
  state: 'OPEN',
  isInMergeQueue: false,
  isDraft: false,
  viewerDidAuthor: false,
}

const disableArg = {
  table: {
    disable: true,
  },
}

const meta = {
  title: 'Pull Requests/mergebox/MergeStatusButton',
  component: MergeStatusButton,
  argTypes: {
    isDraft: disableArg,
    state: disableArg,
    isInMergeQueue: disableArg,
    mergeRequirements: disableArg,
    viewerDidAuthor: disableArg,
    mergeStatusButtonRef: disableArg,
    toggleMergeabilitySidesheet: disableArg,
  },
} satisfies Meta<typeof MergeStatusButton>

export default meta

type Story = StoryObj<typeof MergeStatusButton>

export const Mergeable: Story = {
  render: () => (
    <MergeStatusButton
      {...{...mockPullRequest, mergeRequirements: mockMergeRequirementsFromRelay.mergeable}}
      {...defaultProps}
    />
  ),
  play: ({canvasElement, step}) => {
    step('Shows correct info"', () => {
      expect(within(canvasElement).getByText('Merge pull request')).toBeInTheDocument()
    })
  },
}

export const ChecksPending: Story = {
  render: () => (
    <MergeStatusButton
      {...{...mockPullRequest, mergeRequirements: mockMergeRequirementsFromRelay.checksPending}}
      {...defaultProps}
    />
  ),
  play: ({canvasElement, step}) => {
    step('Shows correct info"', () => {
      expect(within(canvasElement).getByText('Checks pending')).toBeInTheDocument()
    })
  },
}

export const ChecksFailing: Story = {
  render: () => (
    <MergeStatusButton
      {...{...mockPullRequest, mergeRequirements: mockMergeRequirementsFromRelay.checksFailing}}
      {...defaultProps}
    />
  ),
  play: ({canvasElement, step}) => {
    step('Shows correct info"', () => {
      expect(within(canvasElement).getByText('Checks failing')).toBeInTheDocument()
    })
  },
}

export const DraftReadyForReview: Story = {
  render: () => (
    <MergeStatusButton
      {...{...mockPullRequest, isDraft: true, mergeRequirements: mockMergeRequirementsFromRelay.awaitingReview}}
      {...defaultProps}
    />
  ),
  play: ({canvasElement, step}) => {
    step('Shows correct info"', () => {
      expect(within(canvasElement).getByText('Draft')).toBeInTheDocument()
    })
  },
}

export const DraftAndMergeable: Story = {
  render: () => (
    <MergeStatusButton
      {...{...mockPullRequest, isDraft: true, mergeRequirements: mockMergeRequirementsFromRelay.mergeable}}
      {...defaultProps}
    />
  ),
  play: ({canvasElement, step}) => {
    step('Shows correct info"', () => {
      expect(within(canvasElement).getByText('Draft')).toBeInTheDocument()
    })
  },
}

export const AwaitingReview: Story = {
  render: () => (
    <MergeStatusButton
      {...{...mockPullRequest, mergeRequirements: mockMergeRequirementsFromRelay.awaitingReview}}
      {...defaultProps}
    />
  ),
  play: ({canvasElement, step}) => {
    step('Shows correct info"', () => {
      expect(within(canvasElement).getByText('Awaiting reviews')).toBeInTheDocument()
    })
  },
}

export const ChangesRequested: Story = {
  render: () => (
    <MergeStatusButton
      {...{...mockPullRequest, mergeRequirements: mockMergeRequirementsFromRelay.changesRequested}}
      {...defaultProps}
    />
  ),
  play: ({canvasElement, step}) => {
    step('Shows correct info"', () => {
      expect(within(canvasElement).getByText('Changes requested')).toBeInTheDocument()
    })
  },
}

export const InMergeQueue: Story = {
  render: () => (
    <MergeStatusButton
      {...{
        ...mockPullRequest,
        isInMergeQueue: true,
        mergeRequirements: mockMergeRequirementsFromRelay.changesRequested,
      }}
      {...defaultProps}
    />
  ),
  play: ({canvasElement, step}) => {
    step('Shows correct info"', () => {
      expect(within(canvasElement).getByText('Queued')).toBeInTheDocument()
    })
  },
}

export const MergeConflicts: Story = {
  render: () => (
    <MergeStatusButton
      {...{
        ...mockPullRequest,
        mergeRequirements: mockMergeRequirementsFromRelay.mergeConflicts,
      }}
      {...defaultProps}
    />
  ),
  play: ({canvasElement, step}) => {
    step('Shows correct info"', () => {
      expect(within(canvasElement).getByText('Merge conflicts')).toBeInTheDocument()
    })
  },
}

export const Unknown: Story = {
  render: () => (
    <MergeStatusButton
      {...{
        ...mockPullRequest,
        mergeRequirements: mockMergeRequirementsFromRelay.unknown,
      }}
      {...defaultProps}
    />
  ),
  play: ({canvasElement, step}) => {
    step('Shows correct info"', () => {
      expect(within(canvasElement).getByText('Unknown')).toBeInTheDocument()
    })
  },
}

export const UnableToMerge: Story = {
  render: () => (
    <MergeStatusButton
      {...{
        ...mockPullRequest,
        mergeRequirements: mockMergeRequirementsFromRelay.unableToMerge,
      }}
      {...defaultProps}
    />
  ),
  play: ({canvasElement, step}) => {
    step('Shows correct info"', () => {
      expect(within(canvasElement).getByText('Unable to merge')).toBeInTheDocument()
    })
  },
}
