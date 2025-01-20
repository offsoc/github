import type {Meta, StoryObj} from '@storybook/react'
import {MemoryRouter} from 'react-router-dom'

import {MergeQueueSection, type Props, type RemoveFromQueueFunction} from './MergeQueueSection'
import type {MergeQueueEntryState} from '../../../types'
import {noop} from '@github-ui/noop'

const meta: Meta<typeof MergeQueueSection> = {
  title: 'Pull Requests/mergebox/MergeQueueSection',
  component: MergeQueueSection,
  decorators: [
    Story => (
      <MemoryRouter>
        <div style={{maxWidth: '600px'}}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

type StoryProps = {
  positionInQueue: number
  mergeQueueEntryState: MergeQueueEntryState
  removalState: string
}
type Story = StoryObj<Props & StoryProps>

const handleSuccessfulRemoveFromQueue: RemoveFromQueueFunction = ({onCompleted}) => {
  onCompleted()
}

const handleUnsuccessfulRemoveFromQueue: RemoveFromQueueFunction = ({onError}) => {
  onError(new Error('This pull request could not be removed from the merge queue. Please wait and try again.'))
}

const defaultProps = {
  id: 'pullRequest123',
  mergeQueue: {
    url: 'https://github.localhost/monalisa/smile/queue',
  },
  viewerCanAddAndRemoveFromMergeQueue: true,
  onRemoveFromQueue: handleSuccessfulRemoveFromQueue,
  removalState: 'SUCCESS',
  focusPrimaryMergeButton: noop,
}

export const Story: Story = {
  args: {
    positionInQueue: 1,
    mergeQueueEntryState: 'LOCKED',
    viewerCanAddAndRemoveFromMergeQueue: true,
    removalState: 'SUCCESS',
  },
  argTypes: {
    positionInQueue: {control: 'number'},
    mergeQueueEntryState: {
      options: ['AWAITING_CHECKS', 'LOCKED', 'MERGEABLE', 'QUEUED', 'UNMERGEABLE'],
      control: 'radio',
    },
    removalState: {
      options: ['SUCCESS', 'PENDING', 'ERROR'],
      control: 'radio',
    },
    mergeQueue: {
      table: {
        disable: true,
      },
    },
    mergeQueueEntry: {
      table: {
        disable: true,
      },
    },
    onRemoveFromQueue: {
      table: {
        disable: true,
      },
    },
  },
  render: ({positionInQueue, mergeQueueEntryState, removalState, ...args}: StoryProps) => {
    const props = {
      ...defaultProps,
      ...args,
      onRemoveFromQueue:
        removalState === 'SUCCESS'
          ? handleSuccessfulRemoveFromQueue
          : removalState === 'ERROR'
            ? handleUnsuccessfulRemoveFromQueue
            : () => {},
      mergeQueueEntry: {
        position: positionInQueue,
        state: mergeQueueEntryState,
      },
    }

    return <MergeQueueSection {...props} />
  },
}

export default meta
