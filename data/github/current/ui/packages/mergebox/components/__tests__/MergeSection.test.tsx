import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {createMockEnvironment} from 'relay-test-utils'

import {MergeSectionTestComponent as MergeSection} from '../../test-utils/MergeSectionTestComponent'
import type {MergeSectionProps} from '../sections/merge-section/MergeSection'
import {MergeAction, MergeMethod, type PullRequestMergeRequirements, type ViewerMergeActions} from '../../types'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {BASE_PAGE_DATA_URL} from '@github-ui/pull-request-page-data-tooling/render-with-query-client'
import {mockFetch} from '@github-ui/mock-fetch'

const defaultDirectMerge = (isAllowableWithBypass = false): ViewerMergeActions => [
  {
    name: MergeAction.DIRECT_MERGE,
    isAllowable: true,
    mergeMethods: [
      {
        name: MergeMethod.MERGE,
        isAllowable: true,
        isAllowableWithBypass,
      },
      {
        name: MergeMethod.SQUASH,
        isAllowable: true,
        isAllowableWithBypass,
      },
      {
        name: MergeMethod.REBASE,
        isAllowable: true,
        isAllowableWithBypass,
      },
    ],
  },
  {
    name: MergeAction.MERGE_QUEUE,
    isAllowable: false,
    mergeMethods: [
      {
        name: MergeMethod.MERGE,
        isAllowable: true,
        isAllowableWithBypass: false,
      },
    ],
  },
]

const defaultMergeQueue: ViewerMergeActions = [
  {
    name: MergeAction.DIRECT_MERGE,
    isAllowable: false,
    mergeMethods: [
      {
        name: MergeMethod.MERGE,
        isAllowable: true,
        isAllowableWithBypass: false,
      },
      {
        name: MergeMethod.SQUASH,
        isAllowable: true,
        isAllowableWithBypass: false,
      },
      {
        name: MergeMethod.REBASE,
        isAllowable: true,
        isAllowableWithBypass: false,
      },
    ],
  },
  {
    name: MergeAction.MERGE_QUEUE,
    isAllowable: true,
    mergeMethods: [
      {
        name: MergeMethod.MERGE,
        isAllowable: true,
        isAllowableWithBypass: false,
      },
    ],
  },
]

const defaultCleanConflictsCondition: PullRequestMergeRequirements['conditions'][number] = {
  __typename: 'PullRequestMergeConflictStateCondition',
  message: null,
  result: 'PASSED',
}

const defaultMergeRequirements: PullRequestMergeRequirements = {
  commitAuthor: 'octocat@github.com',
  conditions: [defaultCleanConflictsCondition],
  state: 'UNMERGEABLE',
  commitMessageBody: 'commit body',
  commitMessageHeadline: 'commit headline',
}

const pullRequestWithDefaultMergeActionsAndMethods: MergeSectionProps = {
  autoMergeRequest: null,
  baseRefName: 'main',
  id: 'pullRequest:1',
  isDraft: false,
  isInMergeQueue: false,
  mergeQueue: null,
  mergeStateStatus: 'CLEAN',
  numberOfCommits: 2,
  viewerCanAddAndRemoveFromMergeQueue: true,
  viewerCanDisableAutoMerge: false,
  viewerCanEnableAutoMerge: false,
  viewerMergeActions: defaultDirectMerge(),
  ...defaultMergeRequirements,
  conflictsCondition: defaultCleanConflictsCondition,
  mergeRequirementsState: defaultMergeRequirements.state,
  isReadingFromJSONAPI: false,
}

describe('Merge section', () => {
  describe('disabled', () => {
    test('it renders an aria-disabled merge button when either merge action is not allowable (if PR is draft, closed or user does not have permissions to merge)', async () => {
      const environment = createMockEnvironment()
      const {user} = render(
        <MergeSection environment={environment} {...pullRequestWithDefaultMergeActionsAndMethods} />,
      )

      const primaryButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(primaryButton).toHaveAttribute('aria-disabled', 'true')

      const selectMergeMethodButton = screen.getByRole('button', {name: 'Select merge method'})
      expect(selectMergeMethodButton).toHaveAttribute('aria-disabled', 'true')
      await user.click(selectMergeMethodButton)

      expect(
        screen.getByRole('tooltip', {name: 'Merging is blocked due to failing merge requirements'}),
      ).toBeInTheDocument()
    })
  })

  describe('auto merge', () => {
    test('shows "auto-merge" when the repo has auto-merge enabled and viewer can enable auto-merge', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        viewerCanEnableAutoMerge: true,
      }

      render(<MergeSection environment={environment} {...pullRequest} />)

      const button = screen.getByRole('button', {name: 'Enable auto-merge'})
      expect(button).toBeInTheDocument()
    })

    test('"Enable auto-merge" button is not visible if the user cannot enable auto-merge', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        viewerCanEnableAutoMerge: false,
      }

      render(<MergeSection environment={environment} {...pullRequest} />)

      const button = screen.queryByRole('button', {name: 'Enable auto-merge'})
      expect(button).not.toBeInTheDocument()

      const mergePullRequestButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(mergePullRequestButton).toBeInTheDocument()
    })

    test('"Enable auto-merge" button click sends analytics event', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        viewerCanEnableAutoMerge: true,
      }
      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const button = screen.getByRole('button', {name: 'Enable auto-merge'})
      await user.click(button)

      expectAnalyticsEvents({
        type: 'direct_merge_section.auto_merge_click',
        target: 'MERGEBOX_AUTO_MERGE_SECTION_MERGE_BUTTON',
      })
    })

    test('renders error message if enabling auto-merge fails', async () => {
      const environment = createMockEnvironment()

      const enableAutoMergePageDataRoute = `${BASE_PAGE_DATA_URL}/page_data/${PageData.enableAutoMerge}`

      mockFetch.mockRouteOnce(enableAutoMergePageDataRoute, {}, {status: 500, ok: false})

      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        viewerCanEnableAutoMerge: true,
      }
      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const enableAutoMergeButton = screen.getByRole('button', {name: 'Enable auto-merge'})
      await user.click(enableAutoMergeButton)

      const confirmAutoMergeButton = screen.getByRole('button', {name: 'Confirm auto-merge'})
      await user.click(confirmAutoMergeButton)

      expect(screen.getByText('Failed enabling auto-merge for pull request.')).toBeVisible()
    })

    test('shows the "Disable auto-merge" button when auto-merge is active', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        autoMergeRequest: {
          mergeMethod: 'MERGE',
        },
        viewerCanDisableAutoMerge: true,
      }

      render(<MergeSection environment={environment} {...pullRequest} />)

      const button = screen.getByRole('button', {name: 'Disable auto-merge'})
      expect(button).toBeInTheDocument()
    })

    test('the "Disable auto-merge" button is disbaled when the user cannot disable auto-merge', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        autoMergeRequest: {
          mergeMethod: 'MERGE',
        },
        viewerCanDisableAutoMerge: false,
      }

      render(<MergeSection environment={environment} {...pullRequest} />)

      const button = screen.getByRole('button', {name: 'Disable auto-merge'})
      expect(button).toBeDisabled()
    })

    test('renders error message if disabling auto-merge fails', async () => {
      const environment = createMockEnvironment()

      const disableAutoMergePageDataRoute = `${BASE_PAGE_DATA_URL}/page_data/${PageData.disableAutoMerge}`

      mockFetch.mockRouteOnce(disableAutoMergePageDataRoute, {}, {status: 500, ok: false})

      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        autoMergeRequest: {
          mergeMethod: 'MERGE',
        },
        viewerCanDisableAutoMerge: true,
      }
      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const disableAutoMergeButton = screen.getByRole('button', {name: 'Disable auto-merge'})
      await user.click(disableAutoMergeButton)

      expect(screen.getByText('Failed to disable auto-merge for pull request.')).toBeVisible()
    })

    test('sends analytics event when the cancel button is clicked', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        viewerCanEnableAutoMerge: true,
      }
      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const enableAutoMergeButton = screen.getByRole('button', {name: 'Enable auto-merge'})

      await user.click(enableAutoMergeButton)

      const cancelButton = screen.getByRole('button', {name: 'Cancel'})
      await user.click(cancelButton)

      expectAnalyticsEvents(
        {
          type: 'direct_merge_section.auto_merge_click',
          target: 'MERGEBOX_AUTO_MERGE_SECTION_MERGE_BUTTON',
        },
        {
          type: 'direct_merge_section.cancel_auto_merge',
          target: 'MERGEBOX_AUTO_MERGE_CANCEL_CONFIRMATION_BUTTON',
        },
      )
    })

    test('sends analytics event when the "Disable auto-merge" button is clicked', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        autoMergeRequest: {
          mergeMethod: 'MERGE',
        },
        viewerCanDisableAutoMerge: true,
      }
      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const disableAutoMergeButton = screen.getByRole('button', {name: 'Disable auto-merge'})

      await user.click(disableAutoMergeButton)

      expectAnalyticsEvents({
        type: 'auto_merge_section.disable_auto_merge',
        target: 'MERGEBOX_AUTO_MERGE_DISABLE_BUTTON',
      })
    })
  })

  describe('merge queue', () => {
    test('shows "merge when ready" when the repo uses the merge queue', async () => {
      const pullRequest = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        viewerMergeActions: defaultMergeQueue,
      }
      const environment = createMockEnvironment()
      render(<MergeSection environment={environment} {...pullRequest} />)

      const button = screen.getByRole('button', {name: 'Merge when ready'})
      expect(button).toBeInTheDocument()
    })

    describe('button actions', () => {
      test('are enabled when the merge requirement state is UNMERGEABLE', async () => {
        const environment = createMockEnvironment()
        const pullRequest: MergeSectionProps = {
          ...pullRequestWithDefaultMergeActionsAndMethods,
          viewerMergeActions: defaultMergeQueue,
          mergeRequirementsState: 'UNMERGEABLE',
        }
        render(<MergeSection environment={environment} {...pullRequest} />)

        const mergeWhenReadyButton = screen.getByRole('button', {name: 'Merge when ready'})
        expect(mergeWhenReadyButton).toHaveAttribute('aria-disabled', 'false')

        const selectMethodQueueMethodButton = screen.getByRole('button', {name: 'Select merge queue method'})
        expect(selectMethodQueueMethodButton).toHaveAttribute('aria-disabled', 'false')
      })

      test('when aria-disabled, does not perform action and shows tooltip instead', async () => {
        const environment = createMockEnvironment()
        const pullRequest: MergeSectionProps = {
          ...pullRequestWithDefaultMergeActionsAndMethods,
          viewerMergeActions: defaultMergeQueue,
          mergeStateStatus: 'UNKNOWN',
          mergeRequirementsState: 'UNKNOWN',
        }

        const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

        const button = screen.getByRole('button', {name: 'Merge when ready'})
        expect(button).toHaveAttribute('aria-disabled', 'true')

        // Expect confirmation does not appear
        await user.click(button)
        const tooltip = screen.getByRole('tooltip', {name: 'Merging is blocked due to failing merge requirements'})
        expect(tooltip).toBeInTheDocument()
        expect(screen.queryByRole('button', {name: 'Confirm merge when ready'})).not.toBeInTheDocument()

        const mergeQueueOptionsButton = screen.getByRole('button', {name: 'Select merge queue method'})
        expect(mergeQueueOptionsButton).toHaveAttribute('aria-disabled', 'true')

        await user.hover(mergeQueueOptionsButton)
        expect(
          screen.getByRole('tooltip', {name: 'Merging is blocked due to failing merge requirements'}),
        ).toBeInTheDocument()

        // Expect action list does not appear
        await user.click(mergeQueueOptionsButton)
        expect(screen.queryByText('Queue and merge in a group')).not.toBeInTheDocument()
        expect(screen.queryByText('Queue and force solo merge')).not.toBeInTheDocument()
      })

      test('are aria-disabled when the merge requirement state is UNKNOWN', async () => {
        const environment = createMockEnvironment()
        const pullRequest: MergeSectionProps = {
          ...pullRequestWithDefaultMergeActionsAndMethods,
          viewerMergeActions: defaultMergeQueue,
          mergeStateStatus: 'UNKNOWN',
          mergeRequirementsState: 'UNKNOWN',
        }

        render(<MergeSection environment={environment} {...pullRequest} />)

        const button = screen.getByRole('button', {name: 'Merge when ready'})
        expect(button).toHaveAttribute('aria-disabled', 'true')

        const selectMethodQueueMethodButton = screen.getByRole('button', {name: 'Select merge queue method'})
        expect(selectMethodQueueMethodButton).toHaveAttribute('aria-disabled', 'true')
      })

      test('are aria-disabled in draft mode', async () => {
        const environment = createMockEnvironment()
        const pullRequest: MergeSectionProps = {
          ...pullRequestWithDefaultMergeActionsAndMethods,
          isDraft: true,
          viewerMergeActions: defaultMergeQueue,
          mergeStateStatus: 'UNKNOWN',
          mergeRequirementsState: 'UNKNOWN',
        }

        render(<MergeSection environment={environment} {...pullRequest} />)

        const button = screen.getByRole('button', {name: 'Merge when ready'})
        expect(button).toHaveAttribute('aria-disabled', 'true')

        const selectMethodQueueMethodButton = screen.getByRole('button', {name: 'Select merge queue method'})
        expect(selectMethodQueueMethodButton).toHaveAttribute('aria-disabled', 'true')
      })

      test('are enabled when the merge requirement state is MERGEABLE', async () => {
        const environment = createMockEnvironment()
        const pullRequest: MergeSectionProps = {
          ...pullRequestWithDefaultMergeActionsAndMethods,
          isDraft: false,
          viewerMergeActions: defaultMergeQueue,
          mergeStateStatus: 'CLEAN',
          mergeRequirementsState: 'MERGEABLE',
        }
        render(<MergeSection environment={environment} {...pullRequest} />)

        const button = screen.getByRole('button', {name: 'Merge when ready'})
        expect(button).toHaveAttribute('aria-disabled', 'false')

        const selectMethodQueueMethodButton = screen.getByRole('button', {name: 'Select merge queue method'})
        expect(selectMethodQueueMethodButton).toHaveAttribute('aria-disabled', 'false')
      })
    })

    test('shows link to merge queue in messaging', async () => {
      const environment = createMockEnvironment()
      const mergeQueueUrl = 'http://github.localhost.com/monalisa/smile/queue'
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        viewerMergeActions: defaultMergeQueue,
        mergeQueue: {
          url: mergeQueueUrl,
        },
      }

      render(<MergeSection environment={environment} {...pullRequest} />)

      const link = screen.getByRole('link', {name: 'merge queue'})
      expect(link).toBeInTheDocument()
      expect((link as HTMLAnchorElement).href).toBe(mergeQueueUrl)
    })

    test('displaying merge when ready method options', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        viewerMergeActions: defaultMergeQueue,
        mergeQueue: {
          url: 'http://github.localhost.com/monalisa/smile/queue',
        },
      }

      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const primaryButton = screen.getByRole('button', {name: 'Merge when ready'})
      expect(primaryButton).toBeInTheDocument()

      const mergeQueueOptionsButton = screen.getByRole('button', {name: 'Select merge queue method'})
      expect(mergeQueueOptionsButton).toBeInTheDocument()

      await user.click(mergeQueueOptionsButton)
      expect(screen.getByText('Queue and merge in a group')).toBeInTheDocument()
      expect(
        screen.getByText(
          `This pull request will be automatically grouped with other pull requests and merged into main.`,
        ),
      ).toBeInTheDocument()
      expect(screen.getByText('Queue and force solo merge')).toBeInTheDocument()
      expect(screen.getByText(`This pull request will be merged into main by itself.`)).toBeInTheDocument()
    })

    test('selecting merge queue methods', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        viewerMergeActions: defaultMergeQueue,
        mergeQueue: {
          url: 'http://github.localhost.com/monalisa/smile/queue',
        },
      }
      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const primaryButton = screen.getByRole('button', {name: 'Merge when ready'})
      expect(primaryButton).toBeInTheDocument()

      const mergeQueueOptionsButton = screen.getByRole('button', {name: 'Select merge queue method'})
      expect(mergeQueueOptionsButton).toBeInTheDocument()

      await user.click(mergeQueueOptionsButton)
      let checkedOption = screen.getByRole('menuitemradio', {checked: true})

      expect(checkedOption.textContent).toContain('Queue and merge in a group')

      await user.click(screen.getByText('Queue and force solo merge'))

      // open options again to check for selected option since selection closes the menu
      await user.click(mergeQueueOptionsButton)

      checkedOption = screen.getByRole('menuitemradio', {checked: true})
      expect(checkedOption.textContent).toContain('Queue and force solo merge')

      // Select original merge queue method
      await user.click(screen.getByText('Queue and merge in a group'))

      // assert that both selecting both merge options send analytic events
      expectAnalyticsEvents(
        {
          type: 'merqe_queue_section.select_queue_and_force_solo_merge',
          target: 'MERGEBOX_MERGE_QUEUE_SECTION_MERGE_METHOD_MENU_ITEM',
        },
        {
          type: 'merqe_queue_section.select_queue_and_merge_in_a_group',
          target: 'MERGEBOX_MERGE_QUEUE_SECTION_MERGE_METHOD_MENU_ITEM',
        },
      )

      // open options again to check for selected option since selection closes the menu
      await user.click(mergeQueueOptionsButton)

      checkedOption = screen.getByRole('menuitemradio', {checked: true})
      expect(checkedOption.textContent).toContain('Queue and merge in a group')
    })

    test('confirming adding to merge queue', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        viewerMergeActions: defaultMergeQueue,
        mergeQueue: {
          url: 'http://github.localhost.com/monalisa/smile/queue',
        },
      }
      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const primaryButton = screen.getByRole('button', {name: 'Merge when ready'})
      expect(primaryButton).toBeInTheDocument()
      await user.click(primaryButton)

      const confirmAddToQueueButton = screen.getByRole('button', {name: 'Confirm merge when ready'})
      expect(confirmAddToQueueButton).toBeInTheDocument()
      expect(confirmAddToQueueButton).toHaveFocus()
      expect(primaryButton).not.toBeInTheDocument()
    })

    test('"Merge when ready" button, confirmation and cancellation actions send analytics events', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        viewerMergeActions: defaultMergeQueue,
        mergeQueue: {
          url: 'http://github.localhost.com/monalisa/smile/queue',
        },
      }
      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      await user.click(screen.getByRole('button', {name: 'Merge when ready'}))
      await user.click(screen.getByRole('button', {name: 'Cancel'}))
      await user.click(screen.getByRole('button', {name: 'Merge when ready'}))
      await user.click(screen.getByRole('button', {name: 'Confirm merge when ready'}))

      // Assert analytics calls
      // (1x for cancel, 1x for confirmation, and 2x opening direct merge confirmation)
      expectAnalyticsEvents(
        {type: 'auto_merge_section.merge_click', target: 'MERGEBOX_AUTO_MERGE_BUTTON'},
        {type: 'auto_merge_section.cancel_auto_merge', target: 'MERGEBOX_AUTO_MERGE_CANCEL_CONFIRMATION_BUTTON'},
        {type: 'auto_merge_section.merge_click', target: 'MERGEBOX_AUTO_MERGE_BUTTON'},
        {type: 'auto_merge_section.confirm_direct_merge', target: 'MERGEBOX_AUTO_MERGE_CONFIRMATION_BUTTON'},
      )
    })

    describe('auto merge', () => {
      test('shows "Disable auto-merge" button when auto merge is active', async () => {
        const environment = createMockEnvironment()
        const pullRequest: MergeSectionProps = {
          ...pullRequestWithDefaultMergeActionsAndMethods,
          autoMergeRequest: {
            mergeMethod: 'MERGE',
          },
          viewerMergeActions: defaultMergeQueue,
          mergeQueue: {
            url: 'http://github.localhost.com/monalisa/smile/queue',
          },
          viewerCanDisableAutoMerge: true,
        }

        render(<MergeSection environment={environment} {...pullRequest} />)

        const button = screen.getByRole('button', {name: 'Disable auto-merge'})
        expect(button).toBeEnabled()
        expect(screen.getByText('be added to the merge queue')).toBeVisible()
      })

      test('"Disable auto-merge" button click sends analytics event', async () => {
        const environment = createMockEnvironment()
        const pullRequest: MergeSectionProps = {
          ...pullRequestWithDefaultMergeActionsAndMethods,
          autoMergeRequest: {
            mergeMethod: 'MERGE',
          },
          viewerMergeActions: defaultMergeQueue,
          mergeQueue: {
            url: 'http://github.localhost.com/monalisa/smile/queue',
          },
          viewerCanDisableAutoMerge: true,
        }
        const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

        await user.click(screen.getByRole('button', {name: 'Disable auto-merge'}))
        expectAnalyticsEvents({
          type: 'auto_merge_section.disable_auto_merge',
          target: 'MERGEBOX_AUTO_MERGE_DISABLE_BUTTON',
        })
      })

      test('shows error banner when disabling auto merge fails', async () => {
        const environment = createMockEnvironment()
        const disableAutoMergePageDataRoute = `${BASE_PAGE_DATA_URL}/page_data/${PageData.disableAutoMerge}`
        mockFetch.mockRouteOnce(disableAutoMergePageDataRoute, {}, {status: 500, ok: false})

        const pullRequest: MergeSectionProps = {
          ...pullRequestWithDefaultMergeActionsAndMethods,
          autoMergeRequest: {
            mergeMethod: 'MERGE',
          },
          viewerMergeActions: defaultMergeQueue,
          mergeQueue: {
            url: 'http://github.localhost.com/monalisa/smile/queue',
          },
          viewerCanDisableAutoMerge: true,
        }
        const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

        await user.click(screen.getByRole('button', {name: 'Disable auto-merge'}))

        expect(screen.getByText('Failed to disable auto-merge for pull request.')).toBeVisible()
      })
    })
  })

  describe('direct merge options', () => {
    test('renders alternate instructions', async () => {
      const environment = createMockEnvironment()

      render(<MergeSection environment={environment} {...pullRequestWithDefaultMergeActionsAndMethods} />)

      expect(
        screen.getByText('You can also merge this with the command line, view command line instructions.'),
      ).toBeVisible()
    })

    describe('button actions', () => {
      test('when aria-disabled, does not perform actions and shows tooltip instead', async () => {
        const environment = createMockEnvironment()
        const pullRequest: MergeSectionProps = {
          ...pullRequestWithDefaultMergeActionsAndMethods,
          mergeRequirementsState: 'UNKNOWN',
        }
        const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

        const mergeButton = screen.getByRole('button', {name: 'Merge pull request'})
        expect(mergeButton).toHaveAttribute('aria-disabled', 'true')

        await user.hover(mergeButton)
        const tooltip = screen.getByRole('tooltip', {name: 'Merging is blocked due to failing merge requirements'})
        expect(tooltip).toBeInTheDocument()

        const mergeButtonOptions = screen.getByRole('button', {name: 'Select merge method'})
        expect(mergeButtonOptions).toHaveAttribute('aria-disabled', 'true')

        await user.click(mergeButtonOptions)
        expect(screen.queryByText('Squash and merge')).not.toBeInTheDocument()
        expect(screen.queryByText('Rebase and merge')).not.toBeInTheDocument()
      })

      test('are aria-disabled when the merge requirement state is UNMERGEABLE', async () => {
        const environment = createMockEnvironment()
        const pullRequest: MergeSectionProps = {
          ...pullRequestWithDefaultMergeActionsAndMethods,
          mergeRequirementsState: 'UNMERGEABLE',
        }
        render(<MergeSection environment={environment} {...pullRequest} />)

        const mergeButton = screen.getByRole('button', {name: 'Merge pull request'})
        expect(mergeButton).toHaveAttribute('aria-disabled', 'true')

        const mergeButtonOptions = screen.getByRole('button', {name: 'Select merge method'})
        expect(mergeButtonOptions).toHaveAttribute('aria-disabled', 'true')
      })

      test('are aria-disabled when the merge requirement state is UNKNOWN', async () => {
        const environment = createMockEnvironment()
        const pullRequest: MergeSectionProps = {
          ...pullRequestWithDefaultMergeActionsAndMethods,
          mergeRequirementsState: 'UNKNOWN',
        }
        render(<MergeSection environment={environment} {...pullRequest} />)

        const button = screen.getByRole('button', {name: 'Merge pull request'})
        expect(button).toHaveAttribute('aria-disabled', 'true')

        const mergeButtonOptions = screen.getByRole('button', {name: 'Select merge method'})
        expect(mergeButtonOptions).toHaveAttribute('aria-disabled', 'true')
      })

      test('are enabled when the merge requirement state is MERGEABLE', async () => {
        const environment = createMockEnvironment()
        const pullRequest: MergeSectionProps = {
          ...pullRequestWithDefaultMergeActionsAndMethods,
          mergeRequirementsState: 'MERGEABLE',
        }
        const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

        const button = screen.getByRole('button', {name: 'Merge pull request'})
        expect(button).toHaveAttribute('aria-disabled', 'false')

        await user.hover(button)
        const tooltip = screen.queryByRole('tooltip', {name: 'Merging is blocked due to failing merge requirements'})
        expect(tooltip).not.toBeInTheDocument()

        const mergeButtonOptions = screen.getByRole('button', {name: 'Select merge method'})
        expect(mergeButtonOptions).toHaveAttribute('aria-disabled', 'false')
      })
    })

    test('sets selected merge method to preferred merge method based on context value', async () => {
      const environment = createMockEnvironment()
      render(
        <MergeSection
          defaultMergeMethod={MergeMethod.SQUASH}
          environment={environment}
          {...pullRequestWithDefaultMergeActionsAndMethods}
        />,
      )

      const primaryButton = screen.getByRole('button', {name: 'Squash and merge'})
      expect(primaryButton).toBeInTheDocument()
    })

    test('renders all allowed merge methods and sends analytics when selecting them', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
        numberOfCommits: 22,
      }
      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const mergeButtonOptions = screen.getByLabelText('Select merge method')
      await user.click(mergeButtonOptions)
      const mergeCommitOption = screen.getByText('Create a merge commit')
      screen.getByText('All commits from this branch will be added to the base branch via a merge commit.')
      await user.click(mergeCommitOption)
      // reopen menu
      await user.click(mergeButtonOptions)
      const squashAndMergeOption = screen.getByText('Squash and merge')
      screen.getByText('The 22 commits from this branch will be combined into one commit in the base branch.')
      await user.click(squashAndMergeOption)
      // reopen menu
      await user.click(mergeButtonOptions)
      const rebaseAndMergeOption = screen.getByText('Rebase and merge')
      screen.queryByText('The 22 commits from this branch will be rebased and added to the base branch.')
      await user.click(rebaseAndMergeOption)

      expectAnalyticsEvents(
        {
          type: 'direct_merge_section.select_create_a_merge_commit',
          target: 'MERGEBOX_DIRECT_MERGE_SECTION_MERGE_METHOD_MENU_ITEM',
        },
        {
          type: 'direct_merge_section.select_squash_and_merge',
          target: 'MERGEBOX_DIRECT_MERGE_SECTION_MERGE_METHOD_MENU_ITEM',
        },
        {
          type: 'direct_merge_section.select_rebase_and_merge',
          target: 'MERGEBOX_DIRECT_MERGE_SECTION_MERGE_METHOD_MENU_ITEM',
        },
      )
    })

    test('renders all the allowed merge methods, messaging handles single commits', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
        numberOfCommits: 1,
      }
      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const mergeButtonOptions = screen.getByLabelText('Select merge method')
      expect(mergeButtonOptions).toBeInTheDocument()
      await user.click(mergeButtonOptions)

      const mergeCommitOption = screen.getByText('Create a merge commit')
      expect(mergeCommitOption).toBeInTheDocument()
      const mergeCommitText = screen.getByText(
        'All commits from this branch will be added to the base branch via a merge commit.',
      )
      expect(mergeCommitText).toBeInTheDocument()
      const squashAndMergeOption = screen.getByText('Squash and merge')
      expect(squashAndMergeOption).toBeInTheDocument()
      const squashAndMergeText = screen.getByText('The 1 commit from this branch will be added to the base branch.')
      expect(squashAndMergeText).toBeInTheDocument()
      const rebaseAndMergeOption = screen.getByText('Rebase and merge')
      expect(rebaseAndMergeOption).toBeInTheDocument()
      const rebaseAndMergeText = screen.queryByText(
        'The 1 commit from this branch will be rebased and added to the base branch.',
      )
      expect(rebaseAndMergeText).toBeInTheDocument()
    })

    test('does not render create merge commit option when it is not an allowed merge method', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
        viewerMergeActions: [
          {
            name: MergeAction.DIRECT_MERGE,
            isAllowable: true,
            mergeMethods: [
              {
                name: MergeMethod.MERGE,
                isAllowable: false,
                isAllowableWithBypass: false,
              },
              {
                name: MergeMethod.SQUASH,
                isAllowable: true,
                isAllowableWithBypass: false,
              },
              {
                name: MergeMethod.REBASE,
                isAllowable: true,
                isAllowableWithBypass: false,
              },
            ],
          },
        ],
      }

      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const mergeButtonOptions = screen.getByRole('button', {name: 'Select merge method'})
      expect(mergeButtonOptions).toBeInTheDocument()
      await user.click(mergeButtonOptions)

      const mergeCommitOption = screen.queryByText('Create a merge commit')
      expect(mergeCommitOption).not.toBeInTheDocument()
    })

    test('sets merge method and does not render select merge method if there is only one allowed merge method', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
        viewerMergeActions: [
          {
            name: MergeAction.DIRECT_MERGE,
            isAllowable: true,
            mergeMethods: [
              {
                name: MergeMethod.MERGE,
                isAllowable: false,
                isAllowableWithBypass: false,
              },
              {
                name: MergeMethod.SQUASH,
                isAllowable: true,
                isAllowableWithBypass: false,
              },
              {
                name: MergeMethod.REBASE,
                isAllowable: false,
                isAllowableWithBypass: false,
              },
            ],
          },
        ],
      }

      render(<MergeSection defaultMergeMethod={MergeMethod.SQUASH} environment={environment} {...pullRequest} />)

      const mergeButtonOptions = screen.queryByRole('button', {name: 'Select merge method'})
      expect(mergeButtonOptions).not.toBeInTheDocument()
      const squashMergeButton = screen.queryByRole('button', {name: 'Squash and merge'})
      expect(squashMergeButton).toBeInTheDocument()
    })

    test('can set the selected merge method from available options', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
      }
      const {user} = render(
        <MergeSection defaultMergeMethod={MergeMethod.MERGE} environment={environment} {...pullRequest} />,
      )

      const mergeButtonOptions = screen.getByRole('button', {name: 'Select merge method'})
      expect(mergeButtonOptions).toBeInTheDocument()
      const selectedMergeMethodButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(selectedMergeMethodButton).toBeInTheDocument()
      await user.click(mergeButtonOptions)
      const squashAndMergeOption = screen.getByText('Squash and merge')
      expect(squashAndMergeOption).toBeInTheDocument()
      await user.click(squashAndMergeOption)
      const squashAndMergeButton = screen.getByRole('button', {name: 'Squash and merge'})
      expect(squashAndMergeButton).toBeInTheDocument()
    })

    test('ability to select from merge methods depends on mergeability', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'UNKNOWN',
      }

      const {user} = render(
        <MergeSection defaultMergeMethod={MergeMethod.MERGE} environment={environment} {...pullRequest} />,
      )

      const mergeButtonOptions = screen.getByRole('button', {name: 'Select merge method'})
      expect(mergeButtonOptions).toHaveAttribute('aria-disabled', 'true')
      const selectedMergeMethodButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(selectedMergeMethodButton).toBeInTheDocument()
      await user.click(mergeButtonOptions)
      const tooltip = screen.getByText('Merging is blocked due to failing merge requirements')
      expect(tooltip).toBeInTheDocument()
      const squashAndMergeOption = screen.queryByText('Squash and merge')
      expect(squashAndMergeOption).not.toBeInTheDocument()
    })

    test('button dropdown is active when there is a merge conflict and the selected option is rebase', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'UNMERGEABLE',
        conflictsCondition: {
          result: 'FAILED',
        },
      }
      const {user} = render(
        <MergeSection defaultMergeMethod={MergeMethod.REBASE} environment={environment} {...pullRequest} />,
      )

      const mergeButtonOptions = screen.getByRole('button', {name: 'Select merge method'})
      expect(mergeButtonOptions).toHaveAttribute('aria-disabled', 'false')
      const selectedMergeMethodButton = screen.getByRole('button', {name: 'Rebase and merge'})
      expect(selectedMergeMethodButton).toBeVisible()
      await user.click(mergeButtonOptions)
      const tooltip = screen.queryByText('Merging is blocked due to failing merge requirements')
      expect(tooltip).not.toBeVisible()
      const squashAndMergeOption = screen.getByText('Squash and merge')
      expect(squashAndMergeOption).toBeVisible()
    })
  })

  describe('engaging a direct merge option', () => {
    test('when merge is inactive, show tooltip only when activated (focus, hover, click)', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'UNKNOWN',
      }
      const {user} = render(
        <MergeSection defaultMergeMethod={MergeMethod.MERGE} environment={environment} {...pullRequest} />,
      )

      const traditionalMergeButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(traditionalMergeButton).toBeInTheDocument()
      await user.hover(traditionalMergeButton)

      const tooltip = screen.getByRole('tooltip', {name: 'Merging is blocked due to failing merge requirements'})
      expect(tooltip).toBeInTheDocument()

      // Do not show confirmation screen
      expect(screen.queryByText('Commit header')).not.toBeInTheDocument()
      expect(screen.queryByText('Commit message')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', {name: 'Confirm merge'})).not.toBeInTheDocument()
    })

    test('for traditional merge, shows commit header and message input containing placeholder text with button to confirm', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
        commitMessageHeadline: 'PR title',
        commitMessageBody: 'PR body',
        commitAuthor: 'monalisa@github.com',
      }
      const {user} = render(
        <MergeSection defaultMergeMethod={MergeMethod.MERGE} environment={environment} {...pullRequest} />,
      )

      const traditionalMergeButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(traditionalMergeButton).toBeInTheDocument()
      await user.click(traditionalMergeButton)
      expect(screen.getByText('Commit header')).toBeInTheDocument()
      expect(screen.getByText('Commit message')).toBeInTheDocument()

      const defaultCommitHeader = screen.getByDisplayValue('PR title')
      expect(defaultCommitHeader).toBeInTheDocument()
      const defaultCommitMessage = screen.getByDisplayValue('PR body')
      expect(defaultCommitMessage).toBeInTheDocument()
      expect(screen.getByRole('button', {name: 'Confirm merge'})).toBeInTheDocument()
    })

    test('send analytics events when clicking on direct merge method button, canceling and confirming', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
        commitMessageHeadline: 'PR title',
        commitMessageBody: 'PR body',
        commitAuthor: 'monalisa@github.com',
      }
      const {user} = render(
        <MergeSection defaultMergeMethod={MergeMethod.MERGE} environment={environment} {...pullRequest} />,
      )

      await user.click(screen.getByRole('button', {name: 'Merge pull request'}))

      // Ensure Commit message confirmation
      screen.getByLabelText('Commit message')
      await user.click(screen.getByRole('button', {name: 'Cancel'}))
      await user.click(screen.getByRole('button', {name: 'Merge pull request'}))

      // Ensure Commit message confirmation
      await screen.findByLabelText('Commit message')
      await user.click(screen.getByRole('button', {name: 'Confirm merge'}))

      // Assert analytics calls
      // (1x for cancel, 1x for confirmation, and 2x opening diret merge confirmation)
      expectAnalyticsEvents(
        {type: 'direct_merge_section.direct_merge_click', target: 'MERGEBOX_DIRECT_MERGE_SECTION_MERGE_BUTTON'},
        {type: 'direct_merge_section.cancel_direct_merge', target: 'MERGEBOX_DIRECT_MERGE_CANCEL_CONFIRMATION_BUTTON'},
        {type: 'direct_merge_section.direct_merge_click', target: 'MERGEBOX_DIRECT_MERGE_SECTION_MERGE_BUTTON'},
        {type: 'direct_merge_section.confirm_direct_merge', target: 'MERGEBOX_DIRECT_MERGE_CONFIRMATION_BUTTON'},
      )
    })

    test('for traditional merge, focuses commit header input on render', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
        commitMessageHeadline: 'PR title',
        commitMessageBody: 'PR body',
        commitAuthor: 'monalisa@github.com',
      }

      const {user} = render(
        <MergeSection defaultMergeMethod={MergeMethod.MERGE} environment={environment} {...pullRequest} />,
      )

      const traditionalMergeButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(traditionalMergeButton).toBeInTheDocument()
      await user.click(traditionalMergeButton)
      const commitHeaderInput = screen.getByLabelText('Commit header')

      expect(commitHeaderInput).toBeInTheDocument()
      expect(commitHeaderInput).toHaveFocus()
    })

    test('for squash and merge, shows commit header and message input containing default values with button to confirm', async () => {
      const environment = createMockEnvironment()
      const userEmail = 'monalisa@github.com'
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
        commitMessageHeadline: 'Commit message headline',
        commitMessageBody: 'Commit message body',
        commitAuthor: userEmail,
      }
      const {user} = render(
        <MergeSection defaultMergeMethod={MergeMethod.SQUASH} environment={environment} {...pullRequest} />,
      )

      const squashAndMergeButton = screen.getByRole('button', {name: 'Squash and merge'})
      expect(squashAndMergeButton).toBeInTheDocument()
      await user.click(squashAndMergeButton)
      expect(screen.getByText('Commit header')).toBeInTheDocument()
      expect(screen.getByText('Commit message')).toBeInTheDocument()

      const defaultCommitHeader = screen.getByDisplayValue('Commit message headline')
      expect(defaultCommitHeader).toBeInTheDocument()
      const defaultCommitMessage = screen.getByDisplayValue('Commit message body')
      expect(defaultCommitMessage).toBeInTheDocument()

      expect(screen.getByRole('button', {name: 'Confirm squash and merge'})).toBeInTheDocument()
      expect(screen.getByText(`This commit will be authored by ${userEmail}.`)).toBeInTheDocument()
    })

    test('for squash and merge, focuses commit header input on render', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
        commitMessageHeadline: 'Commit message headline',
        commitMessageBody: 'Commit message body',
      }
      const {user} = render(
        <MergeSection defaultMergeMethod={MergeMethod.SQUASH} environment={environment} {...pullRequest} />,
      )

      const squashAndMergeButton = screen.getByRole('button', {name: 'Squash and merge'})
      expect(squashAndMergeButton).toBeInTheDocument()
      await user.click(squashAndMergeButton)
      const commitHeaderInput = screen.getByLabelText('Commit header')
      expect(commitHeaderInput).toBeInTheDocument()
      expect(commitHeaderInput).toHaveFocus()
    })

    test('for rebase and merge, shows confirmation message with button to confirm', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
        commitMessageHeadline: 'PR title',
        commitMessageBody: 'PR body',
      }
      const {user} = render(
        <MergeSection defaultMergeMethod={MergeMethod.REBASE} environment={environment} {...pullRequest} />,
      )

      const rebaseAndMergeButton = screen.getByRole('button', {name: 'Rebase and merge'})
      expect(rebaseAndMergeButton).toBeInTheDocument()
      await user.click(rebaseAndMergeButton)
      expect(screen.getByText(`This will rebase your changes and merge them into main.`)).toBeInTheDocument()
      expect(screen.getByRole('button', {name: 'Confirm rebase and merge'})).toBeInTheDocument()
    })

    test('cancel closes the confirmation screen, renders the primary action button and focuses it', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
        commitMessageHeadline: 'PR title',
        commitMessageBody: 'PR body',
      }
      const {user} = render(
        <MergeSection defaultMergeMethod={MergeMethod.REBASE} environment={environment} {...pullRequest} />,
      )

      const rebaseAndMergeButton = screen.getByRole('button', {name: 'Rebase and merge'})
      expect(rebaseAndMergeButton).toBeInTheDocument()
      await user.click(rebaseAndMergeButton)
      expect(screen.getByRole('button', {name: 'Confirm rebase and merge'})).toBeInTheDocument()
      const cancelButton = screen.getByRole('button', {name: 'Cancel'})
      expect(cancelButton).toBeInTheDocument()
      await user.click(cancelButton)
      const reRenderedRebaseAndMergeButton = screen.getByRole('button', {name: 'Rebase and merge'})
      expect(reRenderedRebaseAndMergeButton).toBeInTheDocument()
      expect(reRenderedRebaseAndMergeButton).toHaveFocus()
    })

    test('when merge fails, renders an error and focuses the header', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'MERGEABLE',
        commitMessageHeadline: 'PR title',
        commitMessageBody: 'PR body',
      }
      const {user} = render(
        <MergeSection defaultMergeMethod={MergeMethod.REBASE} environment={environment} {...pullRequest} />,
      )

      const rebaseAndMergeButton = screen.getByRole('button', {name: 'Rebase and merge'})
      expect(rebaseAndMergeButton).toBeInTheDocument()
      await user.click(rebaseAndMergeButton)
      const confirmButton = screen.getByRole('button', {name: 'Confirm rebase and merge'})
      expect(confirmButton).toBeInTheDocument()

      await user.click(confirmButton)

      // mock rejecting the merge
      await act(async () => {
        environment.mock.rejectMostRecentOperation(() => new Error('bad merge!!!'))
      })

      const errorHeading = screen.getByText('Failed to merge due to bad merge!!!')
      expect(errorHeading).toBeInTheDocument()
      expect(errorHeading).toHaveFocus()
    })
  })

  describe('bypass merge requirements', () => {
    test('cannot bypass when there is a merge conflict', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        conflictsCondition: {
          result: 'FAILED',
        },
        viewerMergeActions: defaultDirectMerge(true),
      }
      render(<MergeSection environment={environment} {...pullRequest} />)

      expect(
        screen.queryByText('Merge without waiting for requirements to be met (bypass rules)'),
      ).not.toBeInTheDocument()
      const primaryButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(primaryButton).toHaveAttribute('aria-disabled', 'true')
    })

    test('cannot bypass when the PR is in draft mode', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        isDraft: true,
        viewerMergeActions: defaultDirectMerge(true),
      }
      render(<MergeSection environment={environment} {...pullRequest} />)

      expect(
        screen.queryByText('Merge without waiting for requirements to be met (bypass rules)'),
      ).not.toBeInTheDocument()
      const primaryButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(primaryButton).toHaveAttribute('aria-disabled', 'true')
    })

    test('cannot bypass when there is no merge conflict and user does not have permissions', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'UNMERGEABLE',
      }
      render(<MergeSection environment={environment} {...pullRequest} />)

      expect(
        screen.queryByText('Merge without waiting for requirements to be met (bypass rules)'),
      ).not.toBeInTheDocument()

      const primaryButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(primaryButton).toHaveAttribute('aria-disabled', 'true')
    })

    test('does not show bypass checkbox when PR is mergeable', async () => {
      const environment = createMockEnvironment()
      render(<MergeSection environment={environment} {...pullRequestWithDefaultMergeActionsAndMethods} />)

      expect(
        screen.queryByText('Merge without waiting for requirements to be met (bypass rules)'),
      ).not.toBeInTheDocument()
    })

    test('can bypass when there is no merge conflict and user has permissions', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'UNMERGEABLE',
        viewerMergeActions: defaultDirectMerge(true),
      }

      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const bypassCheckbox = screen.getByText('Merge without waiting for requirements to be met (bypass rules)')
      expect(bypassCheckbox).toBeVisible()

      const primaryButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(primaryButton).toHaveAttribute('aria-disabled', 'true')

      await user.click(bypassCheckbox)
      const mergeButton = screen.getByRole('button', {name: 'Bypass rules and merge'})
      await user.click(mergeButton)
      expect(screen.getByRole('button', {name: 'Confirm bypass rules and merge'})).toBeVisible()
    })

    test('can bypass when the current merge method is blocked by default and user has permissions', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'UNMERGEABLE',
        viewerMergeActions: [
          {
            name: MergeAction.DIRECT_MERGE,
            isAllowable: true,
            mergeMethods: [
              {
                name: MergeMethod.MERGE,
                isAllowable: false,
                isAllowableWithBypass: true,
              },
              {
                name: MergeMethod.SQUASH,
                isAllowable: true,
                isAllowableWithBypass: true,
              },
              {
                name: MergeMethod.REBASE,
                isAllowable: true,
                isAllowableWithBypass: true,
              },
            ],
          },
        ],
      }

      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const bypassCheckbox = screen.getByText('Merge without waiting for requirements to be met (bypass rules)')
      expect(bypassCheckbox).toBeVisible()

      const primaryButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(primaryButton).toHaveAttribute('aria-disabled', 'true')

      await user.click(bypassCheckbox)
      const bypassButton = screen.getByRole('button', {name: 'Bypass rules and merge'})
      expect(bypassButton).not.toHaveAttribute('aria-disabled', 'true')
    })

    test('can change merge method when the merge method is blocked and user has permissions for other merge methods', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'UNMERGEABLE',
        viewerMergeActions: [
          {
            name: MergeAction.DIRECT_MERGE,
            isAllowable: true,
            mergeMethods: [
              {
                name: MergeMethod.MERGE,
                isAllowable: false,
                isAllowableWithBypass: true,
              },
              {
                name: MergeMethod.SQUASH,
                isAllowable: true,
                isAllowableWithBypass: true,
              },
              {
                name: MergeMethod.REBASE,
                isAllowable: true,
                isAllowableWithBypass: true,
              },
            ],
          },
        ],
      }
      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const primaryButton = screen.getByRole('button', {name: 'Merge pull request'})
      expect(primaryButton).toHaveAttribute('aria-disabled', 'true')
      const mergeButtonOptions = screen.getByRole('button', {name: 'Select merge method'})
      expect(mergeButtonOptions).not.toHaveAttribute('aria-disabled', 'true')
      await user.click(mergeButtonOptions)

      expect(screen.getByText('Squash and merge')).toBeVisible()
    })

    test('renders the DirectMergeSection when the checkbox is checked', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'UNMERGEABLE',
        viewerMergeActions: defaultDirectMerge(true),
      }

      const {user} = render(<MergeSection environment={environment} {...pullRequest} />)

      const bypassCheckbox = screen.getByText('Merge without waiting for requirements to be met (bypass rules)')
      expect(bypassCheckbox).toBeVisible()
      await user.click(bypassCheckbox)

      const mergeButton = screen.getByRole('button', {name: 'Bypass rules and merge'})
      expect(mergeButton).toBeVisible()
    })

    test('the DirectMergeSection is not rendered when the checkbox is unchecked', async () => {
      const environment = createMockEnvironment()
      const pullRequest: MergeSectionProps = {
        ...pullRequestWithDefaultMergeActionsAndMethods,
        mergeRequirementsState: 'UNMERGEABLE',
        viewerMergeActions: defaultDirectMerge(true),
      }

      render(<MergeSection environment={environment} {...pullRequest} />)

      const bypassCheckbox = screen.getByText('Merge without waiting for requirements to be met (bypass rules)')
      expect(bypassCheckbox).toBeVisible()
      expect(screen.queryByRole('button', {name: 'Bypass rules and merge'})).not.toBeInTheDocument()
    })
  })
})
