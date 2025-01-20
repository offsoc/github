import {act, screen, waitFor, within} from '@testing-library/react'
import {render as reactRender, type User} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'
import {TestWrapper} from '@github-ui/security-campaigns-shared/test-utils/TestWrapper'
import {createRepository, createSecurityCampaignAlert} from '../../test-utils/mock-data'
import {RepoAlertsList, type RepoAlertsListProps} from '../../components/RepoAlertsList'
import type {GetAlertsResponse} from '../../types/get-alerts-response'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {type Environment, RelayEnvironmentProvider} from 'react-relay'

jest.setTimeout(4_500)

const openAlerts = [
  createSecurityCampaignAlert({
    number: 123,
    isFixed: false,
    isDismissed: false,
  }),
  createSecurityCampaignAlert({
    number: 125,
    isFixed: false,
    isDismissed: false,
  }),
  createSecurityCampaignAlert({
    number: 142,
    isFixed: false,
    isDismissed: false,
  }),
]
const openAlertsWithFixes = [
  createSecurityCampaignAlert({
    number: 151,
    isFixed: false,
    isDismissed: false,
    hasSuggestedFix: true,
  }),
  createSecurityCampaignAlert({
    number: 152,
    isFixed: false,
    isDismissed: false,
    hasSuggestedFix: true,
  }),
]
const openAlertsPageTwo = [
  createSecurityCampaignAlert({
    number: 235,
    isFixed: false,
    isDismissed: false,
  }),
]
const closedAlerts = [
  createSecurityCampaignAlert({
    number: 783,
    isFixed: false,
    isDismissed: true,
  }),
  createSecurityCampaignAlert({
    number: 352,
    isFixed: true,
    isDismissed: false,
  }),
]

function defaultGetAlertsResponse(props?: Partial<GetAlertsResponse>): GetAlertsResponse {
  return {
    alerts: openAlerts,
    openCount: openAlerts.length + openAlertsPageTwo.length,
    closedCount: closedAlerts.length,
    nextCursor: 'cursornext',
    prevCursor: '',
    ...props,
  }
}

const mockCreateBranch = () => {
  const createBranchPath = '/github/security-campaigns/security/campaigns/1/branches'
  mockFetch.mockRoute(
    createBranchPath,
    {
      branchName: 'branch-name',
      messages: [],
    },
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )
}

const alertsPath = '/github/security-campaigns/security/campaigns/1/alerts'
type TestWrapperProps = {
  children: React.ReactNode
}

const render = async (
  props: Partial<RepoAlertsListProps> = {},
  environment: Environment = createRelayMockEnvironment().environment,
) => {
  const view = reactRender(
    <RepoAlertsList
      alertsPath={alertsPath}
      repository={createRepository()}
      createBranchPath="/github/security-campaigns/security/campaigns/1/branches"
      closeAlertsPath="/github/security-campaigns/security/campaigns/1/alerts"
      {...props}
    />,
    {
      wrapper: ({children}: TestWrapperProps) => {
        return (
          <RelayEnvironmentProvider environment={environment}>
            <TestWrapper>{children}</TestWrapper>
          </RelayEnvironmentProvider>
        )
      },
    },
  )

  // Wait for the alerts to load
  await waitFor(() => {
    expect(
      screen.getByRole('list', {
        name: `${defaultGetAlertsResponse().openCount + defaultGetAlertsResponse().closedCount} alerts`,
      }),
    ).toBeInTheDocument()
  })

  return view
}

const getActionByName = async (user: User, actionName: string) => {
  // In very rare cases, some actions which are usually visible get collapsed
  // to the overflow menu. This will open the overflow menu to ensure that the
  // action can still be found.
  const moreActionsButton = screen.queryByRole('button', {
    name: 'More Actions',
  })
  if (moreActionsButton) {
    await user.click(moreActionsButton)
  }

  return await screen.findByRole('button', {
    name: actionName,
  })
}

const mockOpenAlertsRoute = (props?: Partial<GetAlertsResponse>) => {
  mockFetch.mockRoute(`${alertsPath}?query=${encodeURIComponent('is:open')}`, defaultGetAlertsResponse(props), {
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  })
}

it('renders', async () => {
  mockOpenAlertsRoute()

  await render()
  const list = await screen.findByRole('list', {
    name: '6 alerts',
  })
  expect(await within(list).findAllByRole('listitem')).toHaveLength(3)
  expect(await within(list).findAllByRole('link')).toHaveLength(3)
})

it('can view closed alerts', async () => {
  mockOpenAlertsRoute()
  const {user} = await render()

  const mock = mockFetch.mockRoute(
    `${alertsPath}?query=${encodeURIComponent('is:closed')}`,
    {
      ...defaultGetAlertsResponse(),
      alerts: closedAlerts,
    } satisfies GetAlertsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  await user.click(
    await screen.findByRole('link', {
      name: /^Closed/,
    }),
  )

  const list = await screen.findByRole('list', {
    name: '6 alerts',
  })
  expect(await within(list).findAllByRole('listitem')).toHaveLength(2)

  expect(mock).toHaveBeenCalled()
})

it('can select alerts', async () => {
  mockOpenAlertsRoute()
  const {user} = await render()

  const checkboxes = await screen.findAllByRole('checkbox', {name: /Select:/})

  await user.click(checkboxes[0]!)

  expect(await screen.findByText('1 of 6 selected')).toBeVisible()

  await user.click(checkboxes[1]!)

  expect(await screen.findByText('2 of 6 selected')).toBeVisible()

  await user.click(checkboxes[1]!)

  expect(await screen.findByText('1 of 6 selected')).toBeVisible()
})

it('can paginate', async () => {
  mockOpenAlertsRoute()
  const {user} = await render()

  expect(
    await screen.findByRole('button', {
      name: 'Previous',
    }),
  ).toBeDisabled()

  const list = await screen.findByRole('list', {
    name: '6 alerts',
  })

  const nextPageMock = mockFetch.mockRoute(
    `${alertsPath}?query=${encodeURIComponent('is:open')}&after=cursornext`,
    {
      ...defaultGetAlertsResponse(),
      alerts: openAlertsPageTwo,
      nextCursor: '',
      prevCursor: 'cursorprev',
    } satisfies GetAlertsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  await user.click(
    await screen.findByRole('button', {
      name: 'Next',
    }),
  )

  await waitFor(() => {
    expect(within(list).getAllByRole('listitem')).toHaveLength(1)
  })
  expect(
    await screen.findByRole('button', {
      name: 'Next',
    }),
  ).toBeDisabled()

  expect(nextPageMock).toHaveBeenCalled()

  const prevPageMock = mockFetch.mockRoute(
    `${alertsPath}?query=${encodeURIComponent('is:open')}&before=cursorprev`,
    {
      ...defaultGetAlertsResponse(),
      nextCursor: 'cursornext',
      prevCursor: '',
    } satisfies GetAlertsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  await user.click(
    await screen.findByRole('button', {
      name: 'Previous',
    }),
  )

  await waitFor(() => {
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
  })
  expect(prevPageMock).toHaveBeenCalled()
})

it('does not show the create branch button when nothing is selected', async () => {
  mockOpenAlertsRoute()

  await render()
  expect(
    screen.queryByRole('button', {
      name: 'Create new branch',
    }),
  ).not.toBeInTheDocument()
})

it('does not show the create branch button when no create branch path is given', async () => {
  mockOpenAlertsRoute()

  const {user} = await render({
    createBranchPath: undefined,
  })

  await user.click(
    await screen.findByRole('checkbox', {
      name: /Select all/,
    }),
  )

  expect(
    screen.queryByRole('button', {
      name: 'Create new branch',
    }),
  ).not.toBeInTheDocument()
})

it('can open the create branch dialog without autofixes', async () => {
  mockOpenAlertsRoute()

  const {user} = await render()
  await user.click(
    await screen.findByRole('checkbox', {
      name: /Select all/,
    }),
  )

  const button = await getActionByName(user, 'Create new branch')
  await act(async () => {
    button.click()
  })

  expect(await screen.findByRole('dialog')).toHaveAccessibleName('Create new branch')
})

it('disables create branch dialog when all selected alerts are fixed or dismissed', async () => {
  mockOpenAlertsRoute()
  const {user} = await render()

  mockFetch.mockRoute(
    `${alertsPath}?query=${encodeURIComponent('is:closed')}`,
    {
      ...defaultGetAlertsResponse(),
      alerts: closedAlerts,
    } satisfies GetAlertsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  await user.click(
    await screen.findByRole('link', {
      name: /^Closed/,
    }),
  )

  await user.click(
    await screen.findByRole('checkbox', {
      name: /Select all/,
    }),
  )

  expect(await getActionByName(user, 'Create new branch')).toBeDisabled()
}, 10000)

it('can open the create branch dialog with autofixes', async () => {
  mockOpenAlertsRoute({alerts: openAlertsWithFixes})
  const {user} = await render()

  await user.click(
    await screen.findByRole('checkbox', {
      name: /Select all/,
    }),
  )

  await user.click(
    await screen.findByRole('button', {
      name: 'Commit autofixes',
    }),
  )

  await user.click(
    await screen.findByRole('listitem', {
      name: 'Commit to new branch',
    }),
  )

  expect(await screen.findByRole('dialog')).toHaveAccessibleName('Commit autofixes to new branch')
}, 10000)

it('can open the add to branch dialog with autofixes', async () => {
  mockOpenAlertsRoute({alerts: openAlertsWithFixes})
  const {user} = await render()

  await user.click(
    await screen.findByRole('checkbox', {
      name: /Select all/,
    }),
  )

  await user.click(
    await screen.findByRole('button', {
      name: 'Commit autofixes',
    }),
  )

  await user.click(
    await screen.findByRole('listitem', {
      name: 'Commit to branch',
    }),
  )

  expect(await screen.findByRole('dialog')).toHaveAccessibleName('Commit autofixes to branch')
}, 10000)

it('clears the selection when a branch is created from the create branch dialog with checkout locally option', async () => {
  mockCreateBranch()
  mockOpenAlertsRoute()

  const {user} = await render()

  await user.click(
    await screen.findByRole('checkbox', {
      name: /Select all/,
    }),
  )

  for (const checkbox of await screen.findAllByRole('checkbox', {name: /Select:/})) {
    expect(checkbox).toBeChecked()
  }

  await user.click(await getActionByName(user, 'Create new branch'))

  const createBranchDialog = await screen.findByRole('dialog')
  await user.click(await within(createBranchDialog).findByRole('button', {name: 'Create branch'}))

  const checkoutDialog = await screen.findByRole('dialog')
  await user.click(await within(checkoutDialog).findByRole('button', {name: 'Close'}))

  expect(
    await screen.findByRole('checkbox', {
      name: /Select all/,
    }),
  ).not.toBeChecked()
  for (const checkbox of await screen.findAllByRole('checkbox', {name: /Select:/})) {
    expect(checkbox).not.toBeChecked()
  }
}, 10000)

it('clears the selection when a branch is created from the create branch dialog with open in desktop option', async () => {
  mockCreateBranch()
  mockOpenAlertsRoute()

  const {user} = await render()

  await user.click(
    await screen.findByRole('checkbox', {
      name: /Select all/,
    }),
  )

  for (const checkbox of await screen.findAllByRole('checkbox', {name: /Select:/})) {
    expect(checkbox).toBeChecked()
  }

  await user.click(await getActionByName(user, 'Create new branch'))

  const createBranchDialog = await screen.findByRole('dialog')
  await user.click(await within(createBranchDialog).findByRole('radio', {name: 'Open branch with GitHub Desktop'}))
  await user.click(await within(createBranchDialog).findByRole('button', {name: 'Create branch'}))

  const openingBranchInDesktopDialog = await screen.findByRole('dialog')
  await user.click(await within(openingBranchInDesktopDialog).findByRole('button', {name: 'Close'}))

  expect(
    await screen.findByRole('checkbox', {
      name: /Select all/,
    }),
  ).not.toBeChecked()
  for (const checkbox of await screen.findAllByRole('checkbox', {name: /Select:/})) {
    expect(checkbox).not.toBeChecked()
  }
}, 10000)
