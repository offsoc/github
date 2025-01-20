import {render} from '@github-ui/react-core/test-utils'
import {ScreenSize} from '@github-ui/screen-size'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {FocusedFileContextProvider} from '../../contexts/FocusedFileContext'
import PullRequestsAppWrapper from '../../test-utils/PullRequestsAppWrapper'
import {buildDiffEntry, buildPullRequest} from '../../test-utils/query-data'
import {Navigation} from '../Navigation'
import NavigationPaneToggle from '../NavigationPaneToggle'
import type {NavigationTestQuery} from './__generated__/NavigationTestQuery.graphql'

interface NavigationTestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId: string
}

function NavigationTestComponent({environment, pullRequestId}: NavigationTestComponentProps) {
  const TestComponent = () => {
    const data = useLazyLoadQuery<NavigationTestQuery>(
      graphql`
        query NavigationTestQuery($pullRequestId: ID!, $startOid: String, $endOid: String, $singleCommitOid: String)
        @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ...Navigation_pullRequest
          }
        }
      `,
      {pullRequestId},
    )

    if (data.pullRequest)
      return (
        <>
          {/* Render the pane toggle to make it easy to test toggling functionality */}
          <NavigationPaneToggle />
          <Navigation showFileTree pullRequest={data.pullRequest} />
        </>
      )
    return null
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <FocusedFileContextProvider>
        <TestComponent />
      </FocusedFileContextProvider>
    </PullRequestsAppWrapper>
  )
}

jest.mock('react-router-dom', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalModule = jest.requireActual('react-router-dom')
  const urlParams = {owner: 'monalisa', repo: 'smile', number: '1'}

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModule,
    useParams: () => urlParams,
  }
})

jest.mock('@github-ui/screen-size', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const original = jest.requireActual('@github-ui/screen-size')

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...original,
    useScreenSize: () => ({
      screenSize: ScreenSize.xxxxlarge,
    }),
  }
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Navigation', () => {
  test('renders default navigation items', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [buildDiffEntry({path: 'pathA'}), buildDiffEntry({path: 'pathB'})],
    })

    render(<NavigationTestComponent environment={environment} pullRequestId={pullRequest.id} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    expect(screen.getByText('Overview')).toBeVisible()
    expect(screen.getByText('Files changed')).toBeVisible()
    expect(screen.getByText('2')).toBeVisible()
    expect(screen.getByLabelText('File Tree')).toBeVisible()
    expect(screen.getByLabelText('Collapse navigation')).toBeVisible()
  })

  test('renders collapsed version of navigation', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({changedFiles: 25})

    render(<NavigationTestComponent environment={environment} pullRequestId={pullRequest.id} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    const toggle = screen.getByLabelText('Collapse navigation')
    expect(toggle).toBeVisible()
    act(() => {
      toggle.click()
    })

    // Collapsed state of nav
    // For the collapsed state, we set aria-label on the link and make aria-labelledby undefined so it doesn't reference an icon without text
    const collapsedOverviewNavigationItem = screen.getByLabelText('Overview')
    expect(collapsedOverviewNavigationItem).toBeVisible()
    expect(collapsedOverviewNavigationItem.getAttribute('aria-label')).toEqual('Overview')
    expect(collapsedOverviewNavigationItem.getAttribute('aria-labelledby')).toBeNull()
    expect(screen.queryByText('Overview')).toBeNull()

    const collapsedFilesChangedNavigationItem = screen.getByLabelText('Files changed')
    expect(collapsedFilesChangedNavigationItem).toBeVisible()
    expect(collapsedFilesChangedNavigationItem.getAttribute('aria-label')).toEqual('Files changed')
    expect(collapsedFilesChangedNavigationItem.getAttribute('aria-labelledby')).toBeNull()
    expect(screen.queryByText('Files changed')).toBeNull()
    expect(screen.queryByText('25')).toBeNull()

    // Expand the navigation
    const collapsedToggle = screen.getByLabelText('Expand navigation')
    expect(collapsedToggle).toBeVisible()

    act(() => {
      collapsedToggle.click()
    })

    // Expanded state of nav
    const expandedOverviewNavigationItem = screen.getByLabelText('Overview')
    expect(expandedOverviewNavigationItem.getAttribute('aria-label')).toBeNull()

    const expandedFilesChangedNavigationItem = screen.getByLabelText('Files changed')
    expect(expandedFilesChangedNavigationItem.getAttribute('aria-label')).toBeNull()
  })
})
