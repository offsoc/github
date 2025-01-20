import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import {MergeQueueSection as TestComponent, type Props} from '../MergeQueueSection'
import {noop} from '@github-ui/noop'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'

const defaultProps: Props = {
  mergeQueue: {
    url: 'https://github.localhost/monalisa/smile/queue',
  },
  mergeQueueEntry: {
    position: 1,
    state: 'AWAITING_CHECKS',
  },
  viewerCanAddAndRemoveFromMergeQueue: true,
  onRemoveFromQueue: noop,
  focusPrimaryMergeButton: noop,
}

describe('MergeQueueSection', () => {
  test('renders remove from queue button if the viewer has permission', async () => {
    const props: Props = {
      ...defaultProps,
      mergeQueueEntry: {
        position: 1,
        state: 'AWAITING_CHECKS',
      },
      viewerCanAddAndRemoveFromMergeQueue: true,
    }

    render(<TestComponent {...props} />)

    expect(screen.getByRole('button', {name: 'Remove from queue'})).toBeInTheDocument()
  })

  test('does not render remove from queue button if the viewer does not have permission', async () => {
    const props: Props = {
      ...defaultProps,
      viewerCanAddAndRemoveFromMergeQueue: false,
    }
    render(<TestComponent {...props} />)

    expect(screen.queryByRole('button', {name: 'Remove from queue'})).not.toBeInTheDocument()
  })

  test('does not render remove from queue button if the merge entry is locked', async () => {
    const props: Props = {
      ...defaultProps,
      mergeQueueEntry: {
        position: 1,
        state: 'LOCKED',
      },
      viewerCanAddAndRemoveFromMergeQueue: true,
    }

    render(<TestComponent {...props} />)

    expect(screen.queryByRole('button', {name: 'Remove from queue'})).not.toBeInTheDocument()
  })

  test('renders an "up next" message if there are no PRs ahead of it in the queue', async () => {
    const props: Props = {
      ...defaultProps,
      mergeQueueEntry: {
        position: 1,
        state: 'QUEUED',
      },
      viewerCanAddAndRemoveFromMergeQueue: true,
    }

    render(<TestComponent {...props} />)

    expect(screen.getByText(/This pull request is next up/)).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'merge queue'})).toBeInTheDocument()
  })

  test('displays how many pull requests are ahead in the queue', async () => {
    const props: Props = {
      ...defaultProps,
      mergeQueueEntry: {
        position: 5,
        state: 'QUEUED',
      },
      viewerCanAddAndRemoveFromMergeQueue: true,
    }

    render(<TestComponent {...props} />)

    expect(screen.getByText(/There are 4 pull requests ahead of this one/)).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'merge queue'})).toBeInTheDocument()
  })

  describe('confirmation dialog', () => {
    test('opens when removing a PR from the queue and handles close & cancel', async () => {
      const props: Props = {
        ...defaultProps,
        mergeQueueEntry: {
          position: 1,
          state: 'AWAITING_CHECKS',
        },
        viewerCanAddAndRemoveFromMergeQueue: true,
      }

      const {user} = render(<TestComponent {...props} />)

      const removeButton = screen.getByRole('button', {name: 'Remove from queue'})
      expect(removeButton).toBeInTheDocument()

      await user.click(removeButton)
      expect(screen.getByLabelText('Remove from the queue?')).toBeInTheDocument()
      const cancelButton = screen.getByRole('button', {name: 'Cancel'})
      expect(cancelButton).toBeInTheDocument()

      await user.click(cancelButton)
      expect(screen.queryByLabelText('Remove from the queue?')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', {name: 'Remove from queue'})).toHaveFocus()

      await user.click(removeButton)
      expect(screen.getByLabelText('Remove from the queue?')).toBeInTheDocument()
      const closeButton = screen.getByLabelText('Close')
      expect(closeButton).toBeInTheDocument()

      await user.click(closeButton)
      expect(screen.queryByLabelText('Remove from the queue?')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', {name: 'Remove from queue'})).toHaveFocus()
    })

    test('opens when removing a PR from the queue and handles successful confirming removal', async () => {
      const removeCompletedMock = jest.fn().mockImplementation(({onCompleted}) => {
        onCompleted()
      })
      const focusPrimaryMergeButtonMock = jest.fn()

      const props: Props = {
        ...defaultProps,
        mergeQueueEntry: {
          position: 1,
          state: 'AWAITING_CHECKS',
        },
        viewerCanAddAndRemoveFromMergeQueue: true,
        onRemoveFromQueue: removeCompletedMock,
        focusPrimaryMergeButton: focusPrimaryMergeButtonMock,
      }

      const {user} = render(<TestComponent {...props} />)

      const removeButton = screen.getByRole('button', {name: 'Remove from queue'})
      expect(removeButton).toBeInTheDocument()

      await user.click(removeButton)
      expect(screen.getByLabelText('Remove from the queue?')).toBeInTheDocument()
      const confirmRemoveButton = screen.getByRole('button', {name: 'Remove from the queue'})
      expect(confirmRemoveButton).toBeInTheDocument()

      await user.click(confirmRemoveButton)
      expect(removeCompletedMock).toHaveBeenCalled()
      expect(screen.queryByLabelText('Remove from the queue?')).not.toBeInTheDocument()
      expect(screen.queryByText('Removing from queue')).not.toBeInTheDocument()
      expect(focusPrimaryMergeButtonMock).toHaveBeenCalled()

      expectAnalyticsEvents({
        type: 'merge_queue_section.dequeue_pull_request',
        target: 'MERGEBOX_MERGE_QUEUE_SECTION_REMOVE_FROM_QUEUE_BUTTON',
      })
    })

    test('handles dequeueing (pending) state', async () => {
      const removePendingMock = jest.fn().mockImplementation()

      const props: Props = {
        ...defaultProps,
        mergeQueueEntry: {
          position: 1,
          state: 'AWAITING_CHECKS',
        },
        viewerCanAddAndRemoveFromMergeQueue: true,
        onRemoveFromQueue: removePendingMock,
      }

      const {user} = render(<TestComponent {...props} />)

      const removeButton = screen.getByRole('button', {name: 'Remove from queue'})
      expect(removeButton).toBeInTheDocument()

      await user.click(removeButton)
      expect(screen.getByLabelText('Remove from the queue?')).toBeInTheDocument()
      const confirmRemoveButton = screen.getByRole('button', {name: 'Remove from the queue'})
      expect(confirmRemoveButton).toBeInTheDocument()

      await user.click(confirmRemoveButton)
      expect(removePendingMock).toHaveBeenCalled()
      const removingFromQueue = screen.getByRole('button', {name: /Removing from the queue/})
      expect(removingFromQueue).toBeInTheDocument()
      expect(removingFromQueue).toHaveAttribute('aria-busy', 'true')
      expect(screen.getByLabelText('Remove from the queue?')).toBeInTheDocument()

      const cancelButton = screen.getByRole('button', {name: 'Cancel'})
      await user.click(cancelButton)
      expect(screen.getByLabelText('Remove from the queue?')).toBeInTheDocument()
    })

    test('renders errors in a flash message if present', async () => {
      const removeErrorMock = jest.fn().mockImplementation(({onError}) => {
        onError(new Error('whoops!'))
      })

      const props: Props = {
        ...defaultProps,
        mergeQueueEntry: {
          position: 5,
          state: 'QUEUED',
        },
        viewerCanAddAndRemoveFromMergeQueue: true,
        onRemoveFromQueue: removeErrorMock,
      }

      const {user} = render(<TestComponent {...props} />)

      const removeButton = screen.getByRole('button', {name: 'Remove from queue'})
      expect(removeButton).toBeInTheDocument()

      await user.click(removeButton)
      expect(screen.getByLabelText('Remove from the queue?')).toBeInTheDocument()
      const confirmRemoveButton = screen.getByRole('button', {name: 'Remove from the queue'})
      expect(confirmRemoveButton).toBeInTheDocument()

      await user.click(confirmRemoveButton)
      expect(removeErrorMock).toHaveBeenCalled()
      expect(screen.queryByLabelText('Remove from the queue?')).not.toBeInTheDocument()
      expect(screen.getByText('whoops!')).toBeInTheDocument()
      expect(removeButton).toHaveFocus()

      // clears error if user tries again
      await user.click(removeButton)
      expect(screen.queryByText('whoops!')).not.toBeInTheDocument()
    })
  })
})
