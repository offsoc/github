import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {DraftStateSection as TestComponent} from '../DraftStateSection'

import type {DraftStateSectionProps} from '../DraftStateSection'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'

const defaultProps: DraftStateSectionProps = {
  isDraft: true,
  state: 'OPEN',
  viewerCanUpdate: true,
  onMarkReadyForReview: jest.fn(),
}

describe('Draft State Section', () => {
  test('it does not render if the isDraft is false', () => {
    const props = {
      ...defaultProps,
      isDraft: false,
    }
    const {container} = render(<TestComponent {...props} />)

    expect(container).toBeEmptyDOMElement()
  })

  test('when the pr is not open', () => {
    const props: DraftStateSectionProps = {
      ...defaultProps,
      state: 'CLOSED',
    }
    const {container} = render(<TestComponent {...props} />)

    expect(container).toBeEmptyDOMElement()
  })

  test('when the user does not have permission to update the PR', () => {
    const props: DraftStateSectionProps = {
      ...defaultProps,
      viewerCanUpdate: false,
    }
    const {container} = render(<TestComponent {...props} />)

    expect(container).toBeEmptyDOMElement()
  })

  test('it renders, when pull request is in draft', () => {
    const props: DraftStateSectionProps = {
      ...defaultProps,
      isDraft: true,
      state: 'OPEN',
      viewerCanUpdate: true,
    }
    render(<TestComponent {...props} />)

    expect(screen.getByText('Ready for review')).toBeInTheDocument()
  })

  test('shows error banner when marking ready for review fails', async () => {
    const props: DraftStateSectionProps = {
      ...defaultProps,
      isDraft: true,
      state: 'OPEN',
      viewerCanUpdate: true,
      onMarkReadyForReview: ({onError}) => {
        onError()
      },
    }
    const {user} = render(<TestComponent {...props} />)
    await user.click(screen.getByText('Ready for review'))

    expect(screen.getByText('Could not mark ready for review')).toBeVisible()
  })

  test('it emits events when user marks pull request ready for review', async () => {
    const props: DraftStateSectionProps = {
      ...defaultProps,
      isDraft: true,
      state: 'OPEN',
      viewerCanUpdate: true,
    }
    const {user} = render(<TestComponent {...props} />)

    await user.click(screen.getByRole('button', {name: 'Mark pull request ready for review'}))

    expectAnalyticsEvents({
      type: 'draft_state_section.mark_ready_for_review',
      target: 'MERGEBOX_DRAFT_STATE_SECTION_MARK_READY_FOR_REVIEW_BUTTON',
    })
  })
})
