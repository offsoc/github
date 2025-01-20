import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'
import {AppPayloadContext} from '@github-ui/react-core/use-app-payload'
import safeStorage from '@github-ui/safe-storage'
import {fireEvent, screen, act, within} from '@testing-library/react'

import {defaultRepoPolicyInfo, testCodeButtonPayload} from './test-helpers'
import {CodeDropdownButton} from '../components/CodeDropdownButton'
import {CopilotTab} from '../components/CopilotTab'
import {LocalTab} from '../components/LocalTab'
import {CodespacesTab} from '../components/CodespacesTab'

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => navigateFn,
  }
})

jest.mock('@github-ui/use-is-platform', () => {
  return {
    useIsPlatform: () => true,
  }
})

describe('tab nav', () => {
  test('shows tab nav if codespaces is enabled', async () => {
    const payload = {...testCodeButtonPayload}

    const {user} = render(
      <CodeDropdownButton
        primary
        showCodespacesTab={true}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButtonElement = screen.getByRole('button', {name: 'Code'})
    await user.click(codeButtonElement)

    const tabList = screen.getByRole('tablist')
    expect(within(tabList).getByRole('tab', {name: 'Local'})).toBeInTheDocument()
    expect(within(tabList).getByRole('tab', {name: 'Codespaces'})).toBeInTheDocument()
    expect(within(tabList).queryByRole('tab', {name: 'Copilot'})).not.toBeInTheDocument()
  })

  test('shows tab nav if copilot is enabled', async () => {
    const payload = {...testCodeButtonPayload}

    const {user} = render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={true}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButtonElement = screen.getByRole('button', {name: 'Code'})
    await user.click(codeButtonElement)

    const tabList = screen.getByRole('tablist')
    expect(within(tabList).getByRole('tab', {name: 'Local'})).toBeInTheDocument()
    expect(within(tabList).queryByRole('tab', {name: 'Codespaces'})).not.toBeInTheDocument()
    expect(within(tabList).getByRole('tab', {name: 'Copilot'})).toBeInTheDocument()
  })

  test('does not show tab nav on github enterprise', async () => {
    const payload = {...testCodeButtonPayload}
    const {user} = render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={false}
        isEnterprise={true}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButtonElement = screen.getByRole('button', {name: 'Code'})
    await user.click(codeButtonElement)

    // Confirm local menu content has rendered
    expect(screen.getByText('Clone')).toBeInTheDocument()

    // Confirm tabs are not rendered
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', {name: 'Local'})).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', {name: 'Codespaces'})).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', {name: 'Copilot'})).not.toBeInTheDocument()
  })

  test('does not show tab nav when codespaces and copilot are disabled', async () => {
    const payload = {...testCodeButtonPayload}
    const {user} = render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButtonElement = screen.getByRole('button', {name: 'Code'})
    await user.click(codeButtonElement)

    // Confirm local menu content has rendered
    expect(screen.getByText('Clone')).toBeInTheDocument()

    // Confirm tabs are not rendered
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', {name: 'Local'})).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', {name: 'Codespaces'})).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', {name: 'Copilot'})).not.toBeInTheDocument()
  })
})

describe('Codespaces tab', () => {
  test('fetches codespaces content', async () => {
    const payload = {...testCodeButtonPayload}
    const {user} = render(
      <CodeDropdownButton
        primary
        showCodespacesTab={true}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    mockFetch.mockRouteOnce(payload.codespaces.codespacesPath, null, {
      ok: true,
      text: async () => '<div>Test codespaces tab content</div>',
    })

    const codeButton = screen.getByText('Code')
    await user.click(codeButton)

    const codespacesTab = screen.getByRole('tab', {name: 'Codespaces'})
    await user.click(codespacesTab)

    expectMockFetchCalledTimes(payload.codespaces.codespacesPath, 1)
    expect(screen.getByText('Test codespaces tab content')).toBeInTheDocument()
  })

  test('renders the codespaces tab if last tab is set in localStorage', async () => {
    const safeLocalStorage = safeStorage('localStorage')
    safeLocalStorage.setItem('code-button-default-tab', 'cloud')

    const payload = {...testCodeButtonPayload}
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={true}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)

    const codespacesTab = screen.getAllByRole('tab')[1]

    expect(codespacesTab).toHaveAttribute('aria-selected', 'true')
  })

  test('renders an error message', () => {
    const payload = {
      ...testCodeButtonPayload,
      codespaces: {...testCodeButtonPayload.codespaces, hasAccessToCodespaces: false},
    }
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={true}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    const codespacesTab = screen.getByText('Codespaces')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.click(codespacesTab)
    })

    expect(screen.getByText('Codespace access limited')).toBeInTheDocument()
    expect(screen.getByRole('link').getAttribute('href')).toBe('/contact')
  })

  test('renders an emu error message', () => {
    const payload = {
      ...testCodeButtonPayload,
      codespaces: {
        ...testCodeButtonPayload.codespaces,
        hasAccessToCodespaces: false,
        currentUserIsEnterpriseManaged: true,
        repositoryPolicyInfo: {...defaultRepoPolicyInfo, canBill: false, allowed: false},
      },
    }
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={true}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    const codespacesTab = screen.getByText('Codespaces')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.click(codespacesTab)
    })

    expect(screen.getByText('Codespace access limited')).toBeInTheDocument()
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'https://docs.github.com/enterprise-cloud@latest/admin/identity-and-access-management/using-enterprise-managed-users-for-iam/about-enterprise-managed-users',
    )
  })

  test('renders an ip allow list error message', () => {
    const payload = {
      ...testCodeButtonPayload,
      codespaces: {
        ...testCodeButtonPayload.codespaces,
        hasAccessToCodespaces: false,
        repositoryPolicyInfo: {...defaultRepoPolicyInfo, hasIpAllowLists: true, allowed: false},
      },
    }
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={true}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    const codespacesTab = screen.getByText('Codespaces')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.click(codespacesTab)
    })

    expect(screen.getByText('Codespace access limited')).toBeInTheDocument()
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'https://docs.github.com/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/managing-allowed-ip-addresses-for-your-organization',
    )
  })

  test('renders a disabled by business error message', () => {
    const payload = {
      ...testCodeButtonPayload,
      codespaces: {
        ...testCodeButtonPayload.codespaces,
        hasAccessToCodespaces: false,
        repositoryPolicyInfo: {...defaultRepoPolicyInfo, disabledByBusiness: true, allowed: false},
      },
    }
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={true}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    const codespacesTab = screen.getByText('Codespaces')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.click(codespacesTab)
    })

    expect(screen.getByText('Codespace access limited')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Your enterprise has disabled Codespaces at this time. Please contact your enterprise administrator for more information.',
      ),
    ).toBeInTheDocument()
  })

  test('renders a disabled by organization error message', () => {
    const payload = {
      ...testCodeButtonPayload,
      codespaces: {
        ...testCodeButtonPayload.codespaces,
        hasAccessToCodespaces: false,
        repositoryPolicyInfo: {...defaultRepoPolicyInfo, disabledByOrganization: true, allowed: false},
      },
    }
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={true}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    const codespacesTab = screen.getByText('Codespaces')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.click(codespacesTab)
    })

    expect(screen.getByText('Codespace access limited')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Your organization has disabled Codespaces on this repository. Please contact your organization administrator for more information.',
      ),
    ).toBeInTheDocument()
  })

  test('renders a not logged in error message', () => {
    const payload = {
      ...testCodeButtonPayload,
      codespaces: {
        ...testCodeButtonPayload.codespaces,
        hasAccessToCodespaces: false,
        isLoggedIn: false,
      },
    }
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={true}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    const codespacesTab = screen.getByText('Codespaces')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.click(codespacesTab)
    })

    expect(screen.getByText('Sign In Required')).toBeInTheDocument()
    expect(screen.getByRole('link').getAttribute('href')).toBe('/new-codespace')
  })

  test('renders a changes are unsafe error message', async () => {
    const payload = {
      ...testCodeButtonPayload,
      codespaces: {
        ...testCodeButtonPayload.codespaces,
        hasAccessToCodespaces: false,
        repositoryPolicyInfo: {...defaultRepoPolicyInfo, changesWouldBeSafe: false},
      },
    }
    const {user} = render(
      <CodeDropdownButton
        primary
        showCodespacesTab={true}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    user.click(codeButton)

    const codespacesTab = await screen.findByText('Codespaces')

    await user.click(codespacesTab)

    expect(await screen.findByText('Repository access limited')).toBeInTheDocument()

    expect(
      screen.getByText('You do not have access to push to this repository and its owner has disabled forking.'),
    ).toBeInTheDocument()
  })

  afterEach(() => {
    window.localStorage.clear()
  })
})

describe('Local tab', () => {
  test('shows the help url', () => {
    const payload = {...testCodeButtonPayload}
    render(
      <AppPayloadContext.Provider value={{helpUrl: 'https://help.github.com'}}>
        <CodeDropdownButton
          primary
          showCodespacesTab={false}
          showCopilotTab={false}
          isEnterprise={false}
          localTab={<LocalTab {...payload.local} />}
          copilotTab={<CopilotTab {...payload.copilot} />}
          codespacesTab={<CodespacesTab {...payload.codespaces} />}
        />
      </AppPayloadContext.Provider>,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    expect(screen.getAllByRole('link')[0]?.getAttribute('href')).toBe('/help/articles/which-remote-url-should-i-use')
  })

  test('shows the http tab', () => {
    const payload = {...testCodeButtonPayload}
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    expect(screen.getByRole('textbox').getAttribute('value')).toBe('/http')
  })

  test('shows the ssh tab', () => {
    const payload = {...testCodeButtonPayload}
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    fireEvent.click(screen.getByText('SSH'))
    expect(screen.getByRole('textbox').getAttribute('value')).toBe('/ssh')
  })

  test('shows the ssh tab clone warning', () => {
    const payload = {...testCodeButtonPayload}
    payload.local.protocolInfo.showCloneWarning = true
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    fireEvent.click(screen.getByText('SSH'))
    expect(screen.getByText('add a new public key').getAttribute('href')).toBe('/ssh-key')
  })

  test('shows the cli tab', () => {
    const payload = {...testCodeButtonPayload}
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    fireEvent.click(screen.getByText('GitHub CLI'))
    expect(screen.getByRole('textbox').getAttribute('value')).toBe('/gh-cli')
  })

  test('shows the download zip item', () => {
    const payload = {...testCodeButtonPayload}
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    expect(screen.getByLabelText('Download ZIP').tagName).toBe('A')
    expect(screen.getByLabelText('Download ZIP')).toHaveAttribute('href', '/zip')
  })

  test('shows the visual studio item', () => {
    const payload = {...testCodeButtonPayload}
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    fireEvent.click(screen.getByText('Open with Visual Studio'))
    expect(navigateFn).toHaveBeenCalledWith('/vs-clone')
  })

  test('shows the xcode item', () => {
    const payload = {...testCodeButtonPayload}
    render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    fireEvent.click(screen.getByText('Open with Xcode'))
    expect(navigateFn).toHaveBeenCalledWith('/xcode-clone')
  })

  afterEach(() => {
    window.localStorage.clear()
  })
})

describe('Copilot tab', () => {
  test('shows the task textarea', async () => {
    const payload = {...testCodeButtonPayload}
    const {user} = render(
      <AppPayloadContext.Provider value={{helpUrl: 'https://help.github.com'}}>
        <CodeDropdownButton
          primary
          showCodespacesTab={false}
          showCopilotTab={true}
          isEnterprise={false}
          localTab={<LocalTab {...payload.local} />}
          copilotTab={<CopilotTab {...payload.copilot} />}
          codespacesTab={<CodespacesTab {...payload.codespaces} />}
        />
      </AppPayloadContext.Provider>,
    )

    const codeButton = screen.getByRole('button', {name: 'Code'})
    await user.click(codeButton)

    const tabList = screen.getByRole('tablist')
    const copilotTab = within(tabList).getByRole('tab', {name: 'Copilot'})
    await user.click(copilotTab)

    expect(screen.getByRole('textbox', {name: 'Task'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Start task'})).toBeInTheDocument()
  })
})

describe('Editor tab', () => {
  test('shows the editor tab when the editor tab is enabled', async () => {
    const payload = {...testCodeButtonPayload}
    const {user} = render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={true} // editor is only enabled if copilot is enabled
        showGitHubEditorTab={true}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByRole('button', {name: 'Code'})
    await user.click(codeButton)

    expect(screen.getByRole('tab', {name: 'GitHub Editor'})).toBeInTheDocument()
  })

  test('does not show the editor tab when the editor tab is disabled', async () => {
    const payload = {...testCodeButtonPayload}
    const {user} = render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={true} // editor is only enabled if copilot is enabled
        showGitHubEditorTab={false}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByRole('button', {name: 'Code'})
    await user.click(codeButton)

    expect(screen.queryByRole('tab', {name: 'GitHub Editor'})).not.toBeInTheDocument()
  })

  test('does not show the editor tab when copilot is disabled', async () => {
    const payload = {...testCodeButtonPayload}
    const {user} = render(
      <CodeDropdownButton
        primary
        showCodespacesTab={false}
        showCopilotTab={false}
        showGitHubEditorTab={true}
        isEnterprise={false}
        localTab={<LocalTab {...payload.local} />}
        copilotTab={<CopilotTab {...payload.copilot} />}
        codespacesTab={<CodespacesTab {...payload.codespaces} />}
      />,
    )

    const codeButton = screen.getByRole('button', {name: 'Code'})
    await user.click(codeButton)

    expect(screen.queryByRole('tab', {name: 'GitHub Editor'})).not.toBeInTheDocument()
  })
})
