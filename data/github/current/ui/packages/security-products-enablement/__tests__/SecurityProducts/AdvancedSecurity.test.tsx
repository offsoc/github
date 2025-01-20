import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import App from '../../App'
import {type SecuritySettingsContextValue, SecuritySettingsContext} from '../../contexts/SecuritySettingsContext'
import {defaultAppContext} from '../../test-utils/mock-data'
import {securitySettingsContextValue} from '../test-helpers'
import AdvancedSecurity from '../../components/SecurityProducts/AdvancedSecurity'

const mock = jest.fn()
beforeEach(mock.mockClear)

function TestComponent(children: React.ReactNode, options?: Partial<SecuritySettingsContextValue>) {
  return (
    <App>
      <SecuritySettingsContext.Provider value={securitySettingsContextValue(options)}>
        {children}
      </SecuritySettingsContext.Provider>
    </App>
  )
}

describe('Automatic dependency submission', () => {
  it('renders the correct descriptions', async () => {
    const {user} = render(TestComponent(<AdvancedSecurity handleOnSelectGHAS={mock} />), {
      routePayload: defaultAppContext(),
    })

    const description = screen.getByText(
      'Advanced Security features are free for public repositories and billed per active committer in private and internal repositories.',
    )
    expect(description).not.toBeFalsy()

    const dropdown = screen.getByTestId('enable-ghas-dropdown')
    await user.click(dropdown)

    const items = screen.getAllByRole('menuitemradio')
    expect(items).toHaveLength(2)

    expect(items[0]).toHaveTextContent(
      'Enable GitHub Advanced Security for this configuration. Applying it to private repositories will consume licenses.',
    )
    expect(items[1]).toHaveTextContent(
      'Disable all GitHub Advanced Security features in this configuration. Applying it to private repositories will not consume licenses.',
    )
  })
  it('renders the correct descriptions in ghes', async () => {
    const routePayload = defaultAppContext()
    routePayload.capabilities.ghasFreeForPublicRepos = false
    routePayload.capabilities.actionsAreBilled = false
    const {user} = render(TestComponent(<AdvancedSecurity handleOnSelectGHAS={mock} />), {routePayload})

    const description = screen.getByText('Advanced Security features are billed per active committer.')
    expect(description).not.toBeFalsy()

    const dropdown = screen.getByTestId('enable-ghas-dropdown')
    await user.click(dropdown)

    const items = screen.getAllByRole('menuitemradio')
    expect(items).toHaveLength(2)

    expect(items[0]).toHaveTextContent(
      'Enable GitHub Advanced Security for this configuration. Applying it will consume licenses.',
    )
    expect(items[1]).toHaveTextContent(
      'Disable all GitHub Advanced Security features in this configuration. Applying it will not consume licenses.',
    )
  })
})
