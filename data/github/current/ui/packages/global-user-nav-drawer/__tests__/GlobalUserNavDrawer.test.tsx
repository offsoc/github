import {screen, act, within} from '@testing-library/react'
import {render, type User} from '@github-ui/react-core/test-utils'
import {
  GlobalUserNavDrawer,
  type GlobalUserNavDrawerProps,
  type LazyLoadItemDataAttributes,
} from '../GlobalUserNavDrawer'
import {
  getUserNavDrawerProps,
  stashedAccounts,
  enterpriseAccessVerificationMessage,
  enterpriseAccessReason,
} from '../test-utils/mock-data'
import {mockFetch} from '@github-ui/mock-fetch'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import type {StashedAccount} from '../AccountSwitcher'

const props = getUserNavDrawerProps()
const GlobalUserNavDrawerWrapper = (customProps: Partial<GlobalUserNavDrawerProps> = {}) => {
  return <GlobalUserNavDrawer {...getUserNavDrawerProps()} {...customProps} />
}

const fakeLocation = {origin: 'http://github.localhost', pathname: '/monalisa/smile'}
fakeLocation.toString = () => `${fakeLocation.origin}${fakeLocation.pathname}`

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return fakeLocation
    })()
  },
}))
jest.setTimeout(45_000)

beforeEach(() => {
  mockFetch.mockRoute('_side-panels/user.json', undefined, {
    ok: true,
    status: 200,
    json: async () => {
      return {
        userStatus: {},
        showEnterpriseTrial: true,
        hasUnseenFeatures: true,
        stashedAccounts,
      } as LazyLoadItemDataAttributes
    },
  })
})

const renderDrawer = async (customProps: Partial<GlobalUserNavDrawerProps> = {}) => {
  // this disable is necessary because the component fetches data async inside a useEffect
  // eslint-disable-next-line testing-library/no-unnecessary-act
  return await act(async () => render(<GlobalUserNavDrawerWrapper {...customProps} />))
}

test('Renders all items', async () => {
  await renderDrawer({
    showAccountSwitcher: true,
    showCopilot: true,
    showEnterprise: true,
    showEnterprises: true,
    showUpgrade: true,
    showFeaturesPreviews: true,
    showEnterpriseSettings: true,
    showGists: true,
    showSponsors: true,
  })
  expect(screen.getByTestId('global-user-nav-set-status-item')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: 'Your profile'})).toBeInTheDocument()
  expect(screen.getByText('Your Copilot')).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Account switcher'})).toBeInTheDocument()
  expect(screen.getByText('Your enterprise')).toBeInTheDocument()
  expect(screen.getByText('Your enterprises')).toBeInTheDocument()
  expect(screen.getByText('Your sponsors')).toBeInTheDocument()
  expect(screen.getByText('Your gists')).toBeInTheDocument()
  expect(screen.getByText('Upgrade')).toBeInTheDocument()
  expect(screen.getByText('Feature preview')).toBeInTheDocument()
  expect(screen.getByText('Enterprise settings')).toBeInTheDocument()
})

test('Does not render the "Set status" item', async () => {
  await renderDrawer()
  expect(screen.queryByTestId('global-user-nav-set-status')).not.toBeInTheDocument()
})

test('Clicking the "Set status" item opens the user status dialog', async () => {
  const {user} = await renderDrawer()

  expect(screen.queryByLabelText('Edit status')).not.toBeInTheDocument()

  await user.click(screen.getByTestId('global-user-nav-set-status-item'))

  expect(screen.getByLabelText('Edit status')).toBeInTheDocument()
})

describe('Setting the user status', () => {
  async function openUserStatusDialog() {
    await act(() => screen.getByTestId('global-user-nav-set-status-item').click())

    const includeFragment = screen.getByTestId('user-status-dialog-include-fragment')
    await act(() => includeFragment.dispatchEvent(new Event('load')))
  }

  async function leaveForVacation() {
    mockFetch.mockRouteOnce('/users/status', {
      messageHtml: 'On vacation',
      emojiAttributes: {
        tag: 'g-emoji',
        imgPath: 'icons/emoji/unicode/1f334.png',
        attributes: {
          alias: 'palm_tree',
          'fallback-src': '/images/icons/emoji/unicode/1f334.png',
          class: 'emoji',
          align: 'absmiddle',
        },
        raw: '🌴',
      },
    })

    const submitButton = screen.getByRole('button', {name: 'Set status'})
    await act(() => submitButton.click())
  }

  async function clearStatus() {
    mockFetch.mockRouteOnce('/users/status', {})

    const clearButton = screen.getByRole('button', {name: 'Clear status'})
    await act(async () => {
      clearButton.click()
      await Promise.resolve() // provide an extra tick for events to settle
    })
  }

  test('Handle setting and clearing user status', async () => {
    await renderDrawer()

    await openUserStatusDialog()
    await leaveForVacation()
    expect(screen.getByTestId('global-user-nav-set-status-item').textContent).toEqual('🌴On vacation')
    expect(screen.queryByTitle('Edit status')).not.toBeInTheDocument()

    await openUserStatusDialog()
    await clearStatus()
    expect(screen.getByTestId('global-user-nav-set-status-item').textContent).toEqual('Set status')
    expect(screen.queryByTitle('Edit status')).not.toBeInTheDocument()
  })
})

test('Does not render Account Switcher when showAccountSwitcher is false', async () => {
  await renderDrawer({showAccountSwitcher: false})
  expect(screen.queryByRole('button', {name: 'Account switcher'})).not.toBeInTheDocument()
})

test('Does not render Copilot when showCopilot is false', async () => {
  await renderDrawer({showCopilot: false})
  expect(screen.queryByText('Your Copilot')).not.toBeInTheDocument()
})

test('Does not render the "Your enterprise" item when disabled', async () => {
  await renderDrawer({showEnterprise: false})
  expect(screen.queryByText('Your enterprise')).not.toBeInTheDocument()
})

test('Does not render the "Your enterprises" item when disabled', async () => {
  await renderDrawer({showEnterprises: false})
  expect(screen.queryByText('Your enterprises')).not.toBeInTheDocument()
})

test('Does not render the "Your sponsors" item when disabled', async () => {
  await renderDrawer({showSponsors: false})
  expect(screen.queryByText('Your sponsors')).not.toBeInTheDocument()
})

test('Does not render the "Your gists" item when disabled', async () => {
  await renderDrawer({showGists: false})
  expect(screen.queryByText('Your gists')).not.toBeInTheDocument()
})

test('Does not render Upgrade when showUpgrade is false', async () => {
  await renderDrawer({showUpgrade: false})
  expect(screen.queryByText('Upgrade')).not.toBeInTheDocument()
})

test('Does not render the "Feature preview" item when disabled', async () => {
  await renderDrawer({showFeaturesPreviews: false})
  expect(screen.queryByText('Feature preview')).not.toBeInTheDocument()
})

test('Clicking the "Feature preview" item opens the feature preview dialog', async () => {
  await renderDrawer()

  expect(screen.queryByLabelText('Feature preview dialog')).not.toBeInTheDocument()

  await act(() => screen.getByRole('listitem', {name: /^Feature preview/}).click())

  expect(screen.getByLabelText('Feature preview dialog')).toBeInTheDocument()
})

test('Does not render the "Enterprise settings" item when disabled', async () => {
  await renderDrawer({showEnterpriseSettings: false})
  expect(screen.queryByText('Enterprise settings')).not.toBeInTheDocument()
})

test('sends analytics events on click', async () => {
  const {user} = await renderDrawer()

  const targets: Array<{text: string; category?: string; action: string; label?: string}> = [
    {text: 'Your profile', action: 'PROFILE'},
    {text: 'Your repositories', action: 'YOUR_REPOSITORIES'},
    {
      text: 'Your Copilot',
      category: 'try_copilot',
      action: 'click_to_try_copilot',
      label: 'ref_loc:side_panel;ref_cta:your_copilot',
    },
    {text: 'Your projects', action: 'YOUR_PROJECTS'},
    {text: 'Your stars', action: 'YOUR_STARS'},
    {text: 'Your gists', action: 'YOUR_GISTS'},
    {text: 'Your organizations', action: 'YOUR_ORGANIZATIONS'},
    {
      text: 'Your enterprises',
      category: 'enterprises_more_discoverable',
      action: 'click_your_enterprises',
      label: 'ref_loc:side_panel;ref_cta:your_enterprises;is_navigation_redesign:true',
    },
    {text: 'Your enterprise', action: 'YOUR_ENTERPRISE'},
    {text: 'Your sponsors', action: 'SPONSORS'},
    {text: 'Upgrade', action: 'UPGRADE_PLAN'},
    {text: 'Feature preview', action: 'FEATURE_PREVIEW'},
    {text: 'Settings', action: 'SETTINGS'},
    {text: 'Enterprise settings', action: 'ENTERPRISE_SETTINGS'},
    {text: 'GitHub Docs', action: 'DOCS'},
    {text: 'GitHub Support', action: 'SUPPORT'},
    {text: 'GitHub Community', action: 'COMMUNITY'},
    {text: 'Sign out', action: 'LOGOUT'},
  ]

  for (const target of targets) {
    const item = screen.getByText(target.text)
    await user.clickLink(item)
  }

  expectAnalyticsEvents(
    ...targets.map(target => ({
      type: 'analytics.click',
      data: {
        category: target.category ?? 'Global navigation',
        action: target.action,
        ...(target.label ? {label: target.label} : {}),
      },
    })),
  )
})

describe('Account switcher', () => {
  test('Renders the accounts switcher', async () => {
    const activeAccount = stashedAccounts[0]!
    const inactiveAccount = stashedAccounts[1]!
    const expectedLoginHref = `${fakeLocation.origin}${props.loginAccountPath}&login=${
      inactiveAccount.login
    }&return_to=${encodeURIComponent(fakeLocation.toString())}`

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        reload: jest.fn(),
      },
    })
    mockFetch.mockRouteOnce(props.switchAccountPath, {})

    const {user} = await renderDrawer()
    await openAccountSwitcher(user)

    expect(screen.getByRole('menuitem', {name: 'Add account'})).toHaveAttribute('href', props.addAccountPath)
    expect(screen.getByRole('menuitem', {name: 'Sign out...'})).toHaveAttribute('href', '/logout')

    const inactiveAccountItem = getAccountItem(inactiveAccount)
    expect(inactiveAccountItem).toBeInTheDocument()
    expect(inactiveAccountItem).toHaveAttribute('href', expectedLoginHref)

    const activeAccountItem = getAccountItem(activeAccount)
    expect(activeAccountItem).toBeInTheDocument()
    await user.click(activeAccountItem)

    expect(mockFetch.fetch).toHaveBeenCalledWith(
      props.switchAccountPath,
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'GitHub-Verified-Fetch': 'true',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: expect.any(FormData),
      }),
    )

    expect(window.location.reload).toHaveBeenCalled()
  })

  test('Account switcher shows errors', async () => {
    const activeAccount = stashedAccounts[0]!
    mockFetch.mockRouteOnce(props.switchAccountPath, {error: 'Error message'}, {ok: false})

    const {user} = await renderDrawer()
    await openAccountSwitcher(user)
    await user.click(getAccountItem(activeAccount))

    const errorDialog = await screen.findByRole('dialog', {name: 'Switch account'})
    expect(errorDialog).toBeInTheDocument()
    expect(within(errorDialog).getByText('Unable to switch to the selected account.')).toBeInTheDocument()
    // showing the error should close the user drawer
    expect(screen.queryByRole('dialog', {name: 'User navigation'})).not.toBeInTheDocument()

    await user.click(within(errorDialog).getByRole('button', {name: 'Close'}))
    expect(errorDialog).not.toBeInTheDocument()
  })

  test('Account switcher shows enterprise access errors', async () => {
    const activeAccount = stashedAccounts[0]!
    mockFetch.mockRouteOnce(
      props.switchAccountPath,
      {
        error: enterpriseAccessVerificationMessage,
        reason: enterpriseAccessReason,
      },
      {ok: false},
    )

    const {user} = await renderDrawer()
    await openAccountSwitcher(user)
    await user.click(getAccountItem(activeAccount))

    const errorDialog = await screen.findByRole('dialog', {name: 'Switch account'})
    expect(errorDialog).toBeInTheDocument()
    expect(within(errorDialog).getByText(enterpriseAccessVerificationMessage)).toBeInTheDocument()

    await user.click(within(errorDialog).getByRole('button', {name: 'Close'}))
    expect(errorDialog).not.toBeInTheDocument()
  })

  test('Notifies user when user can not add account', async () => {
    const {user} = await renderDrawer({canAddAccount: false})
    await openAccountSwitcher(user)
    expect(screen.getByText('Maximum accounts reached')).toBeInTheDocument()
  })

  async function openAccountSwitcher(user: User) {
    const accountSwitcherButton = screen.getByRole('button', {name: 'Account switcher'})
    expect(accountSwitcherButton).toBeInTheDocument()
    await user.click(accountSwitcherButton)
    expect(screen.getByRole('menu', {name: 'Account switcher'})).toBeInTheDocument()
  }

  function getAccountItem(account: StashedAccount) {
    return screen.getByRole('menuitem', {
      name: `${account.login} ${account.name}`,
    })
  }
})
