import type {Meta, StoryObj} from '@storybook/react'
import type {DraftStateSectionProps, MarkReadyForReviewFunction} from './DraftStateSection'
import {DraftStateSection} from './DraftStateSection'

const defaultProps: DraftStateSectionProps & StoryProps = {
  isDraft: true,
  state: 'OPEN',
  viewerCanUpdate: true,
  onMarkReadyForReview: () => {},
  markReadyForReviewState: 'SUCCESS',
}

type StoryProps = {
  markReadyForReviewState: 'SUCCESS' | 'PENDING' | 'ERROR'
}

const handleSuccessfulMarkReadyForReview: MarkReadyForReviewFunction = ({onCompleted}) => {
  onCompleted()
}

const handleUnsuccessfulMarkReadyForReview: MarkReadyForReviewFunction = ({onError}) => {
  onError()
}

function setOnMarkReadyForReview(markReadyForReview: 'SUCCESS' | 'PENDING' | 'ERROR') {
  switch (markReadyForReview) {
    case 'SUCCESS':
      return handleSuccessfulMarkReadyForReview
    case 'PENDING':
      return () => {}
    case 'ERROR':
      return handleUnsuccessfulMarkReadyForReview
  }
}

const meta: Meta<DraftStateSectionProps & StoryProps> = {
  title: 'Pull Requests/mergebox/DraftStateSection',
  component: DraftStateSection,
  decorators: [
    Story => (
      <div style={{maxWidth: '600px'}}>
        <Story />
      </div>
    ),
  ],
  args: defaultProps,
  argTypes: {
    markReadyForReviewState: {options: ['SUCCESS', 'PENDING', 'ERROR'], control: 'radio'},
  },
}

type Story = StoryObj<DraftStateSectionProps & StoryProps>

export const DraftStateSectionStory: Story = {
  render: ({markReadyForReviewState, ...args}) => {
    const props = {
      ...defaultProps,
      ...args,
      onMarkReadyForReview: setOnMarkReadyForReview(markReadyForReviewState),
    }
    return <DraftStateSection {...props} />
  },
}

export default meta
