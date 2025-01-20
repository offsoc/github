import App from '../../App'
import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SettingValue} from '../../security-products-enablement-types'
import Setting from '../../components/SecurityConfiguration/Setting'
import {securitySettingsContextValue} from '../test-helpers'
import {defaultAppContext, githubRecommendedConfig} from '../../test-utils/mock-data'
import {SecuritySettingsContext, type SecuritySettingsContextValue} from '../../contexts/SecuritySettingsContext'

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

describe('Setting', () => {
  it('redners Enabled for an enabled feature', async () => {
    render(TestComponent(<Setting name="dependabotAlerts" value={SettingValue.Enabled} onChange={mock} />))

    const dropdown = screen.getByTestId('dependabotAlerts')
    expect(dropdown).toHaveTextContent('Enabled')
  })

  it('redners Disabled for an disabled feature', async () => {
    render(TestComponent(<Setting name="dependabotAlerts" value={SettingValue.Disabled} onChange={mock} />))

    const dropdown = screen.getByTestId('dependabotAlerts')
    expect(dropdown).toHaveTextContent('Disabled')
  })

  it('redners Not set for feature that is not set', async () => {
    render(TestComponent(<Setting name="dependabotAlerts" value={SettingValue.NotSet} onChange={mock} />))

    const dropdown = screen.getByTestId('dependabotAlerts')
    expect(dropdown).toHaveTextContent('Not set')
  })

  it('renders default dropdown options', async () => {
    const {user} = render(
      TestComponent(<Setting name="dependabotAlerts" value={SettingValue.Enabled} onChange={mock} />),
    )

    const dropdown = screen.getByTestId('dependabotAlerts')
    await user.click(dropdown)

    const items = screen.getAllByRole('menuitemradio')
    expect(items).toHaveLength(3)

    expect(items[0]).toHaveTextContent('Enabled')
    expect(items[0]).toHaveTextContent('Override existing repository settings and enable this feature.')
    expect(items[1]).toHaveTextContent('Disabled')
    expect(items[1]).toHaveTextContent('Override existing repository settings and disable this feature.')
    expect(items[2]).toHaveTextContent('Not set')
    expect(items[2]).toHaveTextContent('Do not override existing repository settings for this feature.')
  })

  it('calls the onChange handler after a setting is selected', async () => {
    const {user} = render(
      TestComponent(<Setting name="dependabotAlerts" value={SettingValue.Enabled} onChange={mock} />),
    )

    const dropdown = screen.getByTestId('dependabotAlerts')
    await user.click(dropdown)

    const items = screen.getAllByRole('menuitemradio')
    const disabled = items[1]
    expect(disabled).toHaveTextContent('Disabled')

    await user.click(disabled!)

    expect(mock).toHaveBeenCalledWith('dependabotAlerts', SettingValue.Disabled)
  })

  it('overrides dropdown description', async () => {
    const {user} = render(
      TestComponent(
        <Setting
          name="dependabotAlerts"
          value={SettingValue.Enabled}
          onChange={mock}
          overrides={{disabled: {description: 'overriden'}}}
        />,
      ),
    )

    const dropdown = screen.getByTestId('dependabotAlerts')
    await user.click(dropdown)

    const items = screen.getAllByRole('menuitemradio')
    const disabled = items[1]
    expect(disabled).toHaveTextContent('Disabled')
    expect(disabled).toHaveTextContent('overriden')
  })

  it('renders a disabled dropdown', async () => {
    const {user} = render(
      TestComponent(<Setting name="dependabotAlertsVEA" disabled value={SettingValue.Enabled} onChange={mock} />),
    )

    const setting = screen.getByTestId('dependabotAlertsVEA')
    expect(setting).toHaveTextContent('Enabled')

    await user.click(setting)
    const items = screen.queryByRole('menuitemradio')
    expect(items).not.toBeInTheDocument()
  })

  it('renders only the enablement text for GHR config', async () => {
    const routePayload = defaultAppContext()
    routePayload.securityConfiguration = githubRecommendedConfig()

    render(
      <App>
        <Setting name="dependabotAlerts" value={SettingValue.Enabled} onChange={mock} />
      </App>,
      {routePayload},
    )

    const dropdown = screen.queryByTestId('dependabotAlerts')
    expect(dropdown).not.toBeInTheDocument()

    expect(screen.getByTestId('setting-status')).toHaveTextContent('Enabled')
  })
})
