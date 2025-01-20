import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {mockUUID} from '@github-ui/conversations/test-utils'
import {render} from '@github-ui/react-core/test-utils'
import useSafeState from '@github-ui/use-safe-state'
import {act, screen, waitFor, within} from '@testing-library/react'
import {useState} from 'react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {PullRequestContextProvider} from '../../../contexts/PullRequestContext'
import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {buildPullRequest, buildViewer} from '../../../test-utils/query-data'
import type {PullRequestsTargetType} from '../../../types/analytics-events-types'
import ReviewMenu from '../ReviewMenu'
import type {ReviewMenuTestQuery} from './__generated__/ReviewMenuTestQuery.graphql'

function TestComponent({environment}: {environment: ReturnType<typeof createMockEnvironment>}) {
  const ControlsWithRelayQuery = () => {
    const data = useLazyLoadQuery<ReviewMenuTestQuery>(
      graphql`
        query ReviewMenuTestQuery($singleCommitOid: String, $startOid: String, $endOid: String) @relay_test_operation {
          viewer {
            ...ReviewMenu_user
          }
          pullRequest: node(id: "test-id") {
            ... on PullRequest {
              ...ReviewMenu_pullRequest
            }
          }
        }
      `,
      {},
    )

    const [reviewBody, setReviewBody] = useSafeState('')
    const [reviewEvent, setReviewEvent] = useState('COMMENT')

    if (data.pullRequest) {
      return (
        <ReviewMenu
          redirectOnSubmit
          pullRequest={data.pullRequest}
          reviewBody={reviewBody}
          reviewEvent={reviewEvent}
          user={data.viewer}
          onUpdateReviewBody={setReviewBody}
          onUpdateReviewEvent={setReviewEvent}
        />
      )
    }

    return null
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId="mock">
      <PullRequestContextProvider
        headRefOid="mock"
        isInMergeQueue={false}
        pullRequestId="mock"
        repositoryId="mock"
        state="OPEN"
      >
        <ControlsWithRelayQuery />
      </PullRequestContextProvider>
    </PullRequestsAppWrapper>
  )
}

const noPendingComments = {
  viewerPendingReview: {
    comments: {
      totalCount: 0,
    },
  },
}

const onePendingComment = {
  viewerPendingReview: {
    id: 'test-id',
    comments: {
      totalCount: 1,
    },
  },
}

/*
 * Spy on window.location.href to test upgrade navigation
 */
// @ts-expect-error overriding window.location in test
delete window.location
window.location = {hash: ''} as Location
const setHrefSpy = jest.fn()
Object.defineProperty(window.location, 'href', {
  set: setHrefSpy,
  get: () => 'test',
})

describe('basic open/close functionality', () => {
  test('clicking on "Submit review" opens review menu', async () => {
    const environment = createMockEnvironment()

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return {...buildPullRequest({author: {login: 'test-author'}}), ...noPendingComments}
          },
          Viewer() {
            return buildViewer({login: 'test-author'})
          },
        }),
      )
    })

    const reviewButton = await screen.findByRole('button', {name: 'Submit review'})
    await user.click(reviewButton)

    const dialogBox = await screen.findByRole('none')
    const submitButton = await within(dialogBox).findByRole('button', {name: 'Submit review'})

    expect(submitButton).toBeInTheDocument()

    expectAnalyticsEvents<PullRequestsTargetType>({
      type: 'submit_review_dialog.open',
      target: 'REVIEW_CHANGES_BUTTON',
      data: {
        app_name: 'pull_request',
      },
    })
  })

  test('clicking close button closes review menu', async () => {
    const environment = createMockEnvironment()

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return {...buildPullRequest({author: {login: 'test-author'}}), ...noPendingComments}
          },
          Viewer() {
            return buildViewer({login: 'test-author'})
          },
        }),
      )
    })

    const reviewButton = await screen.findByRole('button', {name: 'Submit review'})
    await user.click(reviewButton)

    expect(screen.getByText('Finish your review')).toBeInTheDocument()

    const closeButton = screen.getByLabelText('Close')
    expect(closeButton).toBeInTheDocument()

    await user.click(closeButton)
    await waitFor(() => expect(screen.queryByText('Finish your review')).not.toBeInTheDocument())
  })
})

describe('basic submitting a review, regardless of role, kind, and state', () => {
  test('can submit review via "Submit review" menu', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest()
    const issueId = mockUUID()

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return {...buildPullRequest({author: {login: 'test-author'}}), ...noPendingComments}
          },
          Viewer() {
            return buildViewer({login: 'test-author'})
          },
        }),
      )
    })

    const reviewButton = await screen.findByRole('button', {name: 'Submit review'})
    await user.click(reviewButton)

    expect(screen.getByText('Finish your review')).toBeInTheDocument()
    const reviewCommentInput = screen.getByPlaceholderText('Leave a comment')
    await user.type(reviewCommentInput, 'test comment')

    const dialogBox = await screen.findByRole('none')
    const submitButton = await within(dialogBox).findByRole('button', {name: 'Submit review'})

    let operationParams: {[key: string]: object} | undefined
    await user.click(submitButton)
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      operationParams = environment.mock.getMostRecentOperation().request.variables

      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return {
              pullRequest,
              url: 'test-url',
            }
          },
          PullRequest() {
            return pullRequest
          },
          Issue() {
            return {...{id: issueId}}
          },
        }),
      )
    })

    const input = operationParams?.['input'] as {[key: string]: string | number | boolean} | undefined
    const reviewBody = input?.['body'] as string | undefined
    const reviewEvent = input?.['event'] as string | undefined
    expect(reviewBody).toBe('test comment')
    expect(reviewEvent).toBe('COMMENT')

    expect(setHrefSpy).toHaveBeenCalledWith('test-url')
    expectAnalyticsEvents<PullRequestsTargetType>(
      {
        type: 'submit_review_dialog.open',
        target: 'REVIEW_CHANGES_BUTTON',
        data: {
          app_name: 'pull_request',
        },
      },
      {
        type: 'submit_review_dialog.submit',
        target: 'SUBMIT_REVIEW_BUTTON',
        data: {
          app_name: 'pull_request',
        },
      },
    )
  })

  test('can submit pending review via "Submit review" menu', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({viewerPendingReview: {id: 'test-id', comments: {totalCount: 27}}})
    const issueId = mockUUID()

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
          Viewer() {
            return buildViewer({login: 'test-author'})
          },
        }),
      )
    })

    const reviewButton = await screen.findByRole('button', {name: 'Submit review (27)'})
    await user.click(reviewButton)

    const reviewCommentInput = await screen.findByPlaceholderText('Leave a comment')
    await user.type(reviewCommentInput, 'test comment')

    const dialogBox = await screen.findByRole('none')
    const submitButton = await within(dialogBox).findByRole('button', {name: 'Submit review'})

    await user.click(submitButton)
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return {
              pullRequest,
              url: 'test-url',
            }
          },
          PullRequest() {
            return pullRequest
          },
          Issue() {
            return {...{id: issueId}}
          },
        }),
      )
    })

    expect(setHrefSpy).toHaveBeenCalledWith('test-url')
    await waitFor(() => expect(screen.queryByText('27')).not.toBeInTheDocument())
  })

  test('PR review submission failure shows a banner', async () => {
    const environment = createMockEnvironment()

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return {
              ...buildPullRequest({author: {login: 'test-author'}}),
              viewerPendingReview: {
                comments: {
                  totalCount: 1,
                },
              },
              viewerCanLeaveNonCommentReviews: true,
            }
          },
          User() {
            return buildViewer({login: 'test-viewer'})
          },
        }),
      )
    })

    const reviewButton = await screen.findByRole('button', {name: 'Submit review (1)'})
    await user.click(reviewButton)

    const reviewCommentInput = await screen.findByPlaceholderText('Leave a comment')
    await user.type(reviewCommentInput, 'test comment')

    const dialogBox = await screen.findByRole('none')
    const submitButton = await within(dialogBox).findByRole('button', {name: 'Submit review'})

    await user.click(submitButton)
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      const error = new Error('test-error')
      error.cause = [{message: 'test-error'}]
      environment.mock.rejectMostRecentOperation(error)
    })

    const errorBanner = await screen.findByText('Failed to submit review: test-error')
    expect(errorBanner).toBeInTheDocument()
  })
})

describe('submitting a review, by role, kind, and state', () => {
  test('can submit review via "Submit review" menu with approval', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({viewerCanLeaveNonCommentReviews: true})
    const issueId = mockUUID()

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return {...buildPullRequest({author: {login: 'test-author'}}), ...noPendingComments}
          },
          Viewer() {
            return buildViewer({login: 'test-author'})
          },
        }),
      )
    })

    const reviewButton = await screen.findByRole('button', {name: 'Submit review'})
    await user.click(reviewButton)

    const approvalMessageBox = await screen.findByPlaceholderText('Leave a comment')
    const approvalRadio = (await screen.findAllByRole('radio'))[1]!
    await user.type(approvalMessageBox, 'aaa')
    await user.click(approvalRadio)

    const dialogBox = await screen.findByRole('none')
    const submitButton = await within(dialogBox).findByRole('button', {name: 'Submit review'})

    let operationParams: {[key: string]: object} | undefined
    await user.click(submitButton)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      operationParams = environment.mock.getMostRecentOperation().request.variables

      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return {
              pullRequest,
              url: 'test-url',
            }
          },
          PullRequest() {
            return pullRequest
          },
          Issue() {
            return {...{id: issueId}}
          },
        }),
      )
    })

    const input = operationParams?.['input'] as {[key: string]: string | number | boolean} | undefined
    const reviewBody = input?.['body'] as string | undefined
    const reviewEvent = input?.['event'] as string | undefined
    expect(reviewBody).toBe('aaa')
    expect(reviewEvent).toBe('APPROVE')
    expect(setHrefSpy).toHaveBeenCalledWith('test-url')
  })

  test('can only leave comment review on closed PR when there are one or more pending review comments', async () => {
    const environment = createMockEnvironment()

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return {
              ...buildPullRequest({state: 'CLOSED'}),
              viewerPendingReview: {
                comments: {
                  totalCount: 1,
                },
              },
            }
          },
        }),
      )
    })

    const submitComments = await screen.findByRole('button', {
      name: 'Submit comments (1)',
    })
    await user.click(submitComments)

    const submitRadios = screen.queryAllByRole('radio')
    expect(submitRadios).toHaveLength(0)
  })

  test('PR author cannot approve their pull request with comments', async () => {
    const environment = createMockEnvironment()

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return {
              ...buildPullRequest({author: {login: 'test-author'}}),
              viewerPendingReview: {
                comments: {
                  totalCount: 1,
                },
              },
              // Author always return false here in the API
              viewerCanLeaveNonCommentReviews: false,
            }
          },
          User() {
            return buildViewer({login: 'test-author'})
          },
        }),
      )
    })

    const submitCommentsButton = await screen.findByRole('button', {name: 'Submit comments (1)'})
    await user.click(submitCommentsButton)

    const approvalTooltip = await screen.findByRole('tooltip', {
      name: `Pull request authors can't approve their own pull requests.`,
    })
    const requestedChangesTooltip = screen.getByRole('tooltip', {
      name: `Pull request authors can't request changes on their own pull requests.`,
    })
    const approvalRadio = within(approvalTooltip).getByRole('radio', {
      name: 'Approve Submit feedback and approve merging these changes.',
    })
    expect(approvalRadio).toHaveAttribute('disabled')
    const requestedChangesRadio = within(requestedChangesTooltip).getByRole('radio', {
      name: 'Request changes Submit feedback that must be addressed before merging.',
    })
    expect(requestedChangesRadio).toHaveAttribute('disabled')
  })
})

describe('discarding a PR review', () => {
  test('can discard a review', async () => {
    jest.spyOn(window, 'confirm').mockImplementation(() => true)

    const environment = createMockEnvironment()

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({viewerPendingReview: {id: 'test-id', comments: {totalCount: 27}}})
          },
          Viewer() {
            return buildViewer()
          },
        }),
      )
    })

    const reviewButton = await screen.findByRole('button', {name: 'Submit review (27)'})
    await user.click(reviewButton)

    await screen.findByText('27 pending comments')
    const abandonButton = await screen.findByText('Discard review')

    await user.click(abandonButton)
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return {
              id: 'test-id',
            }
          },
          PullRequest() {
            return buildPullRequest()
          },
        }),
      )
    })

    // abandon button goes away after abandoning review
    await waitFor(() => expect(screen.queryByText('Discard review')).not.toBeInTheDocument())
    await waitFor(() => expect(screen.queryByText('27')).not.toBeInTheDocument())
    expectAnalyticsEvents<PullRequestsTargetType>(
      {
        type: 'submit_review_dialog.open',
        target: 'REVIEW_CHANGES_BUTTON',
        data: {
          app_name: 'pull_request',
        },
      },
      {
        type: 'submit_review_dialog.cancel',
        target: 'CANCEL_REVIEW_BUTTON',
        data: {
          app_name: 'pull_request',
        },
      },
    )
  })

  test('failure shows a banner', async () => {
    const environment = createMockEnvironment()

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return {...buildPullRequest({author: {login: 'test-author'}}), ...noPendingComments}
          },
          User() {
            return buildViewer({login: 'test-reviwer'})
          },
        }),
      )
    })

    const reviewButton = await screen.findByRole('button', {name: 'Submit review'})
    await user.click(reviewButton)

    const abandonButton = await screen.findByText('Discard review')
    await user.click(abandonButton)
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.rejectMostRecentOperation(new Error('test-error'))
    })

    const errorBanner = await screen.findByText('Failed to cancel review: test-error')
    expect(errorBanner).toBeInTheDocument()
  })
})

describe('Author display state', () => {
  describe('PR is open', () => {
    describe('author has 0 pending comments', () => {
      test('renders nothing', async () => {
        const environment = createMockEnvironment()

        render(<TestComponent environment={environment} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return {
                  ...buildPullRequest({state: 'OPEN', author: {login: 'test-author'}}),
                  ...noPendingComments,
                  // API returns false for author viewing PR
                  viewerCanLeaveNonCommentReviews: false,
                }
              },
              Viewer() {
                return buildViewer({login: 'test-author'})
              },
            }),
          )
        })

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
      })
    })

    describe('author has 1 or more pending comments', () => {
      test('renders "Submit comments" button with pending review comment count and "Discard comments" button', async () => {
        const environment = createMockEnvironment()

        const {user} = render(<TestComponent environment={environment} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return {
                  ...buildPullRequest({state: 'OPEN', author: {login: 'test-author'}}),
                  ...onePendingComment,
                  // API returns false for author viewing PR
                  viewerCanLeaveNonCommentReviews: false,
                }
              },
              Viewer() {
                return buildViewer({login: 'test-author'})
              },
            }),
          )
        })

        const submitCommentsButton = screen.getByRole('button', {name: 'Submit comments (1)'})
        expect(submitCommentsButton).toBeInTheDocument()
        await user.click(submitCommentsButton)

        expect(screen.getByRole('button', {name: 'Discard comments'})).toBeInTheDocument()
      })
    })
  })

  describe('PR is not open', () => {
    describe('author has 0 pending comments', () => {
      test('renders nothing', async () => {
        const environment = createMockEnvironment()

        render(<TestComponent environment={environment} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return {
                  ...buildPullRequest({state: 'MERGED', author: {login: 'test-author'}}),
                  ...noPendingComments,
                  // API returns false for author viewing PR
                  viewerCanLeaveNonCommentReviews: false,
                }
              },
              Viewer() {
                return buildViewer({login: 'test-author'})
              },
            }),
          )
        })

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
      })
    })

    describe('author has 1 or more pending comments', () => {
      test('renders "Submit comments" button with pending review comment count and "Discard comments" button', async () => {
        const environment = createMockEnvironment()

        const {user} = render(<TestComponent environment={environment} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return {
                  ...buildPullRequest({state: 'MERGED', author: {login: 'test-author'}}),
                  ...onePendingComment,
                  // API returns false for author viewing PR
                  viewerCanLeaveNonCommentReviews: false,
                }
              },
              Viewer() {
                return buildViewer({login: 'test-author'})
              },
            }),
          )
        })

        const submitCommentsButton = screen.getByRole('button', {name: 'Submit comments (1)'})
        expect(submitCommentsButton).toBeInTheDocument()
        await user.click(submitCommentsButton)

        expect(screen.getByRole('button', {name: 'Discard comments'})).toBeInTheDocument()
      })
    })
  })
})

describe('Reviewer with approval rights display state', () => {
  describe('PR is open', () => {
    describe('when reviewer has 0 pending comments', () => {
      test('renders "Submit review" button', async () => {
        const environment = createMockEnvironment()

        render(<TestComponent environment={environment} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return {
                  ...buildPullRequest({state: 'OPEN', author: {login: 'test-author'}}),
                  ...noPendingComments,
                  viewerCanLeaveNonCommentReviews: true,
                }
              },
              Viewer() {
                return buildViewer({login: 'test-reviewer'})
              },
            }),
          )
        })

        expect(screen.getByRole('button', {name: 'Submit review'})).toBeInTheDocument()
      })
    })

    describe('when reviewer has 1 or more pending comments', () => {
      test('renders "Submit review" button with pending review comment count and "Discard review" button', async () => {
        const environment = createMockEnvironment()

        const {user} = render(<TestComponent environment={environment} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return {
                  ...buildPullRequest({state: 'OPEN', author: {login: 'test-author'}}),
                  ...onePendingComment,
                  viewerCanLeaveNonCommentReviews: true,
                }
              },
              Viewer() {
                return buildViewer({login: 'test-reviewer'})
              },
            }),
          )
        })

        const submitReviewButton = screen.getByRole('button', {name: 'Submit review (1)'})
        expect(submitReviewButton).toBeInTheDocument()
        await user.click(submitReviewButton)

        expect(screen.getByRole('button', {name: 'Discard review'})).toBeInTheDocument()
      })
    })
  })

  describe('PR is not open', () => {
    describe('when reviewer has 0 pending comments', () => {
      test('renders nothing', async () => {
        const environment = createMockEnvironment()

        render(<TestComponent environment={environment} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return {
                  ...buildPullRequest({state: 'MERGED', author: {login: 'test-author'}}),
                  ...noPendingComments,
                  viewerCanLeaveNonCommentReviews: true,
                }
              },
              Viewer() {
                return buildViewer({login: 'test-reviewer'})
              },
            }),
          )
        })

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
      })
    })

    describe('when reviewer has 1 or more pending comments', () => {
      test('renders "Submit comments" button with pending review comment count and "Discard comments" button', async () => {
        const environment = createMockEnvironment()

        const {user} = render(<TestComponent environment={environment} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return {
                  ...buildPullRequest({state: 'MERGED', author: {login: 'test-author'}}),
                  ...onePendingComment,
                  viewerCanLeaveNonCommentReviews: true,
                }
              },
              Viewer() {
                return buildViewer({login: 'test-reviewer'})
              },
            }),
          )
        })

        const submitCommentsButton = screen.getByRole('button', {name: 'Submit comments (1)'})
        expect(submitCommentsButton).toBeInTheDocument()
        await user.click(submitCommentsButton)

        expect(screen.getByRole('button', {name: 'Discard comments'})).toBeInTheDocument()
      })
    })
  })
})

describe('Reviewer without approval rights display state', () => {
  describe('PR is open', () => {
    describe('when reviewer has 0 pending comments', () => {
      test('renders nothing', async () => {
        const environment = createMockEnvironment()

        render(<TestComponent environment={environment} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return {
                  ...buildPullRequest({state: 'OPEN', author: {login: 'test-author'}}),
                  ...noPendingComments,
                  viewerCanLeaveNonCommentReviews: false,
                }
              },
              Viewer() {
                return buildViewer({login: 'test-reviewer'})
              },
            }),
          )
        })

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
      })
    })

    describe('when reviewer has 1 or more pending comments', () => {
      test('renders "Submit comments" buttons with pending review comment count', async () => {
        const environment = createMockEnvironment()

        const {user} = render(<TestComponent environment={environment} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return {
                  ...buildPullRequest({state: 'OPEN', author: {login: 'test-author'}}),
                  ...onePendingComment,
                  viewerCanLeaveNonCommentReviews: false,
                }
              },
              Viewer() {
                return buildViewer({login: 'test-reviewer'})
              },
            }),
          )
        })

        const submitCommentsButton = screen.getByRole('button', {name: 'Submit comments (1)'})
        expect(submitCommentsButton).toBeInTheDocument()
        await user.click(submitCommentsButton)

        expect(screen.getByRole('button', {name: 'Discard comments'})).toBeInTheDocument()
      })
    })
  })

  describe('PR is not open', () => {
    describe('when reviewer has 0 pending comments', () => {
      test('renders nothing', async () => {
        const environment = createMockEnvironment()

        render(<TestComponent environment={environment} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return {
                  ...buildPullRequest({state: 'CLOSED', author: {login: 'test-author'}}),
                  ...noPendingComments,
                  viewerCanLeaveNonCommentReviews: false,
                }
              },
              Viewer() {
                return buildViewer({login: 'test-reviewer'})
              },
            }),
          )
        })

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
      })
    })

    describe('when reviewer has 1 or more pending comments', () => {
      test('renders "Submit comments" buttons with pending review comment count and "Discard comments" button', async () => {
        const environment = createMockEnvironment()

        const {user} = render(<TestComponent environment={environment} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return {
                  ...buildPullRequest({state: 'CLOSED', author: {login: 'test-author'}}),
                  ...onePendingComment,
                  viewerCanLeaveNonCommentReviews: false,
                }
              },
              Viewer() {
                return buildViewer({login: 'test-reviewer'})
              },
            }),
          )
        })

        const submitCommentsButton = screen.getByRole('button', {name: 'Submit comments (1)'})
        expect(submitCommentsButton).toBeInTheDocument()
        await user.click(submitCommentsButton)

        expect(screen.getByRole('button', {name: 'Discard comments'})).toBeInTheDocument()
      })
    })
  })
})

describe('Anonymous user display state', () => {
  describe('PR is open', () => {
    test('renders nothing', async () => {
      const environment = createMockEnvironment()

      render(<TestComponent environment={environment} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            PullRequest() {
              return {state: 'OPEN'}
            },
            User() {
              return {login: null}
            },
          }),
        )
      })

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('PR is not open', () => {
    test('renders nothing', async () => {
      const environment = createMockEnvironment()

      render(<TestComponent environment={environment} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            PullRequest() {
              return {state: 'MERGED'}
            },
            User() {
              return {login: null}
            },
          }),
        )
      })

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
