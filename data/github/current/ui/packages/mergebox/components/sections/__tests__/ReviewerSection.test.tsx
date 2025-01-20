import {render} from '@github-ui/react-core/test-utils'
import {useAnalytics} from '@github-ui/use-analytics'
import {screen} from '@testing-library/react'
import {createMockEnvironment} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import type {PullRequestReviewState, PullRequestRuleFailureReason} from '../../../types'
import type {ReviewerSectionProps} from '../ReviewerSection'
import {ConsolidatedReviewState, getReviewsState, ReviewerSection} from '../ReviewerSection'

jest.mock('@github-ui/use-analytics')
const sendAnalyticsEventMock = jest.fn()
jest.mocked(useAnalytics).mockReturnValue({sendAnalyticsEvent: sendAnalyticsEventMock})

beforeEach(() => sendAnalyticsEventMock.mockReset())

const moreReviewsFailureReason: PullRequestRuleFailureReason = 'MORE_REVIEWS_REQUIRED'
const changesRequestedFailureReason: PullRequestRuleFailureReason = 'CHANGES_REQUESTED'
const socFailureReason: PullRequestRuleFailureReason = 'SOC2_APPROVAL_PROCESS_REQUIRED'
const reviewApprovedState: PullRequestReviewState = 'APPROVED'
const changesRequestedState: PullRequestReviewState = 'CHANGES_REQUESTED'

const reviewerSectionData: ReviewerSectionProps = {
  reviewerRuleRollups: [],
  latestOpinionatedReviews: [
    {
      authorCanPushToRepository: true,
      author: {
        login: 'octocat',
        name: 'octocat',
        url: '',
        avatarUrl: '',
      },
      onBehalfOf: ['some-team-reviewers'],
      state: reviewApprovedState,
    },
  ],
}
describe('getReviewsState', () => {
  it('returns APPROVED when there are no failure reasons and at least one review', () => {
    const reviewsRequired = 1
    const isCodeownersRequired = false
    const reviews: Array<{readonly authorCanPushToRepository: boolean; readonly state: PullRequestReviewState}> = [
      {
        authorCanPushToRepository: false,
        state: 'APPROVED',
      },
    ]
    const failureReasons: PullRequestRuleFailureReason[] = []

    expect(getReviewsState(reviewsRequired, isCodeownersRequired, reviews, failureReasons)).toBe(
      ConsolidatedReviewState.APPROVED,
    )
  })

  it('returns APPROVED when there are no failure reasons and codeowners review is required', () => {
    const reviewsRequired = 0
    const isCodeownersRequired = true
    const reviews: Array<{readonly authorCanPushToRepository: boolean; readonly state: PullRequestReviewState}> = [
      {
        authorCanPushToRepository: false,
        state: 'APPROVED',
      },
    ]
    const failureReasons: PullRequestRuleFailureReason[] = []

    expect(getReviewsState(reviewsRequired, isCodeownersRequired, reviews, failureReasons)).toBe(
      ConsolidatedReviewState.APPROVED,
    )
  })

  it('returns REVIEW_REQUIRED when there are failure reasons that require more reviews', () => {
    const reviewsRequired = 2
    const isCodeownersRequired = false
    const reviews: Array<{readonly authorCanPushToRepository: boolean; readonly state: PullRequestReviewState}> = [
      {
        authorCanPushToRepository: false,
        state: 'APPROVED',
      },
    ]
    const failureReasons: PullRequestRuleFailureReason[] = ['MORE_REVIEWS_REQUIRED']

    expect(getReviewsState(reviewsRequired, isCodeownersRequired, reviews, failureReasons)).toBe(
      ConsolidatedReviewState.REVIEW_REQUIRED,
    )
  })

  it('returns REVIEW_REQUIRED when there are failure reasons that require codeowners review', () => {
    const reviewsRequired = 0
    const isCodeownersRequired = true
    const reviews: Array<{readonly authorCanPushToRepository: boolean; readonly state: PullRequestReviewState}> = [
      {
        authorCanPushToRepository: false,
        state: 'APPROVED',
      },
    ]
    const failureReasons: PullRequestRuleFailureReason[] = ['CODE_OWNER_REVIEW_REQUIRED']

    expect(getReviewsState(reviewsRequired, isCodeownersRequired, reviews, failureReasons)).toBe(
      ConsolidatedReviewState.REVIEW_REQUIRED,
    )
  })

  it('returns REVIEW_REQUIRED when there are failure reasons that require SOC2 approval process', () => {
    const reviewsRequired = 0
    const isCodeownersRequired = false
    const reviews: Array<{readonly authorCanPushToRepository: boolean; readonly state: PullRequestReviewState}> = [
      {
        authorCanPushToRepository: false,
        state: 'APPROVED',
      },
    ]
    const failureReasons: PullRequestRuleFailureReason[] = ['SOC2_APPROVAL_PROCESS_REQUIRED']

    expect(getReviewsState(reviewsRequired, isCodeownersRequired, reviews, failureReasons)).toBe(
      ConsolidatedReviewState.REVIEW_REQUIRED,
    )
  })

  it('returns CHANGES_REQUESTED when there are failure reasons that require changes', () => {
    const reviewsRequired = 0
    const isCodeownersRequired = false
    const reviews: Array<{readonly authorCanPushToRepository: boolean; readonly state: PullRequestReviewState}> = [
      {
        authorCanPushToRepository: false,
        state: 'APPROVED',
      },
    ]
    const failureReasons: PullRequestRuleFailureReason[] = ['CHANGES_REQUESTED']

    expect(getReviewsState(reviewsRequired, isCodeownersRequired, reviews, failureReasons)).toBe(
      ConsolidatedReviewState.CHANGES_REQUESTED,
    )
  })

  it('returns REVIEW_REQUIRED when there are failure reasons that require changes and more reviews', () => {
    const reviewsRequired = 2
    const isCodeownersRequired = false
    const reviews: Array<{readonly authorCanPushToRepository: boolean; readonly state: PullRequestReviewState}> = [
      {
        authorCanPushToRepository: false,
        state: 'APPROVED',
      },
    ]
    const failureReasons: PullRequestRuleFailureReason[] = ['CHANGES_REQUESTED', 'MORE_REVIEWS_REQUIRED']

    expect(getReviewsState(reviewsRequired, isCodeownersRequired, reviews, failureReasons)).toBe(
      ConsolidatedReviewState.REVIEW_REQUIRED,
    )
  })

  it('returns REVIEWED when there are no failure reasons and at least one review and no reviews are required', () => {
    const reviewsRequired = 0
    const isCodeownersRequired = false
    const reviews: Array<{readonly authorCanPushToRepository: boolean; readonly state: PullRequestReviewState}> = [
      {
        authorCanPushToRepository: false,
        state: 'APPROVED',
      },
    ]
    const failureReasons: PullRequestRuleFailureReason[] = []

    expect(getReviewsState(reviewsRequired, isCodeownersRequired, reviews, failureReasons)).toBe(
      ConsolidatedReviewState.REVIEWED,
    )
  })
})
type ReviewerSectionTestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequest: ReviewerSectionProps
}
function ReviewerSectionTestComponent({environment, pullRequest}: ReviewerSectionTestComponentProps) {
  const reviewRules = pullRequest.reviewerRuleRollups
  const reviews = pullRequest.latestOpinionatedReviews

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={'mock'}>
      <ReviewerSection reviewerRuleRollups={reviewRules} latestOpinionatedReviews={reviews} />
    </PullRequestsAppWrapper>
  )
}

describe('reviews are required (pull request rule applies)', () => {
  test('renders reviewer section with no reviewers', async () => {
    const environment = createMockEnvironment()
    const pullRequest = {
      ...reviewerSectionData,
      reviewerRuleRollups: [
        {
          requiredReviewers: 1,
          requiresCodeowners: false,
          failureReasons: [moreReviewsFailureReason],
        },
      ],
      latestOpinionatedReviews: [],
    }
    render(<ReviewerSectionTestComponent environment={environment} pullRequest={pullRequest} />)
    expect(screen.getByText('Review required')).toBeInTheDocument()
  })

  test('renders reviewer section with approving review', async () => {
    const environment = createMockEnvironment()
    const pullRequest = {
      ...reviewerSectionData,
      reviewerRuleRollups: [
        {
          requiredReviewers: 1,
          requiresCodeowners: false,
          failureReasons: [],
        },
      ],
      latestOpinionatedReviews: [
        {
          authorCanPushToRepository: true,
          author: {
            login: 'octocat',
            avatarUrl: '',
            url: '',
          },
          onBehalfOf: ['some-team-reviewers'],
          state: reviewApprovedState,
        },
      ],
    }
    render(<ReviewerSectionTestComponent environment={environment} pullRequest={pullRequest} />)

    expect(screen.getByText('Changes approved')).toBeInTheDocument()
  })

  test('renders section with one required review and one approving review and one review requesting changes', async () => {
    const environment = createMockEnvironment()
    const pullRequest = {
      ...reviewerSectionData,
      reviewerRuleRollups: [
        {
          requiredReviewers: 1,
          requiresCodeowners: false,
          failureReasons: [changesRequestedFailureReason],
        },
      ],
      latestOpinionatedReviews: [
        {
          authorCanPushToRepository: true,
          author: {
            login: 'octocat',
            avatarUrl: '',
            url: '',
          },
          onBehalfOf: ['some-team-reviewers'],
          state: reviewApprovedState,
        },
        {
          authorCanPushToRepository: true,
          author: {
            login: 'octokitten',
            avatarUrl: '/octokitten',
            url: 'wwww.octokeen.com',
          },
          onBehalfOf: ['some-team-reviewers'],
          state: changesRequestedState,
        },
      ],
    }
    render(<ReviewerSectionTestComponent environment={environment} pullRequest={pullRequest} />)
    expect(screen.getByText('Changes requested')).toBeInTheDocument()
  })

  test('renders reviewer section with compliance review required and no reviews', async () => {
    const environment = createMockEnvironment()
    const pullRequest = {
      ...reviewerSectionData,
      reviewerRuleRollups: [
        {
          requiredReviewers: 1,
          requiresCodeowners: false,
          failureReasons: [socFailureReason],
        },
      ],
      latestOpinionatedReviews: [],
    }
    render(<ReviewerSectionTestComponent environment={environment} pullRequest={pullRequest} />)

    const reviewText = screen.getByText(/review from a compliance team is required/)
    expect(reviewText).toBeInTheDocument()
    screen.getByText('Review required')
  })

  test('renders reviewer section with compliance review required and a review requesting changes', async () => {
    const environment = createMockEnvironment()
    const pullRequest = {
      ...reviewerSectionData,
      reviewerRuleRollups: [
        {
          requiredReviewers: 1,
          requiresCodeowners: false,
          failureReasons: [changesRequestedFailureReason, socFailureReason],
        },
      ],
      latestOpinionatedReviews: [
        {
          authorCanPushToRepository: true,
          author: {
            login: 'octocat',
            avatarUrl: '',
            url: '',
          },
          onBehalfOf: ['some-team-reviewers'],
          state: reviewApprovedState,
        },
        {
          authorCanPushToRepository: true,
          author: {
            login: 'octokitten',
            avatarUrl: '/octokitten',
            url: 'wwww.octokeen.com',
          },
          onBehalfOf: ['some-team-reviewers'],
          state: changesRequestedState,
        },
      ],
    }
    render(<ReviewerSectionTestComponent environment={environment} pullRequest={pullRequest} />)
    const reviewText = screen.getByText(/review from a compliance team is required/)
    expect(reviewText).toBeInTheDocument()
    screen.getByText('Review required')
  })

  test('renders reviewer section with 2 reviews required and only 1 approving review', async () => {
    const environment = createMockEnvironment()
    const pullRequest = {
      ...reviewerSectionData,
      reviewerRuleRollups: [
        {
          requiredReviewers: 2,
          requiresCodeowners: false,
          failureReasons: [moreReviewsFailureReason],
        },
      ],
      latestOpinionatedReviews: [
        {
          authorCanPushToRepository: true,
          author: {
            login: 'octocat',
            avatarUrl: '',
            url: '',
          },
          onBehalfOf: ['some-team-reviewers'],
          state: reviewApprovedState,
        },
      ],
    }
    render(<ReviewerSectionTestComponent environment={environment} pullRequest={pullRequest} />)
    const reviewText = screen.getByText(/At least 2 approving reviews are required/)
    expect(reviewText).toBeInTheDocument()
    screen.getByText('Review required')
  })
})

describe('reviews are not required (no pull request rule applies)', () => {
  test('renders reviewer section with no reviews required and an approving review', async () => {
    const environment = createMockEnvironment()
    const pullRequest = {
      ...reviewerSectionData,
      reviewerRuleRollups: [],
      latestOpinionatedReviews: [
        {
          authorCanPushToRepository: true,
          author: {
            login: 'octocat',
            avatarUrl: '',
            url: '',
          },
          onBehalfOf: ['some-team-reviewers'],
          state: reviewApprovedState,
        },
      ],
    }
    render(<ReviewerSectionTestComponent environment={environment} pullRequest={pullRequest} />)
    expect(screen.getByText('Changes reviewed')).toBeInTheDocument()
  })

  test('renders reviewer section with no reviews required and a review requesting changes', async () => {
    const environment = createMockEnvironment()
    const pullRequest = {
      ...reviewerSectionData,
      reviewerRuleRollups: [],
      latestOpinionatedReviews: [
        {
          authorCanPushToRepository: true,
          author: {
            login: 'octocat',
            avatarUrl: '',
            url: '',
          },
          onBehalfOf: ['some-team-reviewers'],
          state: changesRequestedState,
        },
      ],
    }
    render(<ReviewerSectionTestComponent environment={environment} pullRequest={pullRequest} />)
    expect(screen.getByText('Changes reviewed')).toBeInTheDocument()
  })

  test('does not render reviewer section if no reviews are required and there are no reviews', async () => {
    const environment = createMockEnvironment()
    const pullRequest = {
      ...reviewerSectionData,
      reviewerRuleRollups: [
        {
          requiredReviewers: 0,
          requiresCodeowners: false,
          failureReasons: [],
        },
      ],
      latestOpinionatedReviews: [],
    }
    render(<ReviewerSectionTestComponent environment={environment} pullRequest={pullRequest} />)

    expect(screen.queryByText(/Review required/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Changes approved/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Changes reviewed/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Changes requested/)).not.toBeInTheDocument()
  })
})

test("review summary doesn't count reviews where author cannot push to repository in its total counts", async () => {
  const environment = createMockEnvironment()
  const pullRequest = {
    ...reviewerSectionData,
    reviewerRuleRollups: [
      {
        requiredReviewers: 1,
        requiresCodeowners: false,
        failureReasons: [changesRequestedFailureReason],
      },
    ],
    latestOpinionatedReviews: [
      {
        authorCanPushToRepository: true,
        author: {
          login: 'octocat',
          avatarUrl: '',
          url: '',
        },
        onBehalfOf: ['some-team-reviewers'],
        state: reviewApprovedState,
      },
      {
        authorCanPushToRepository: false,
        author: {
          login: 'octokitten',
          avatarUrl: '/octokitten',
          url: 'wwww.octokeen.com',
        },
        onBehalfOf: [],
        state: reviewApprovedState,
      },
    ],
  }
  render(<ReviewerSectionTestComponent environment={environment} pullRequest={pullRequest} />)

  expect(screen.getByText(/1 approving review/)).toBeInTheDocument()
})

describe('Analytics events', () => {
  test('it emits events when user expands or collapses reviewer section', async () => {
    const environment = createMockEnvironment()
    const pullRequest = reviewerSectionData
    const {user} = render(<ReviewerSectionTestComponent environment={environment} pullRequest={pullRequest} />)

    await user.click(screen.getByRole('button', {name: 'Expand reviews'}))

    expect(sendAnalyticsEventMock).toHaveBeenCalledWith(
      'reviewers_section.expand',
      'MERGEBOX_REVIEWERS_SECTION_TOGGLE_BUTTON',
    )

    await user.click(screen.getByRole('button', {name: 'Collapse reviews'}))

    expect(sendAnalyticsEventMock).toHaveBeenCalledWith(
      'reviewers_section.collapse',
      'MERGEBOX_REVIEWERS_SECTION_TOGGLE_BUTTON',
    )

    // Test that we don't make additional calls
    expect(sendAnalyticsEventMock).toHaveBeenCalledTimes(2)
  })
})
