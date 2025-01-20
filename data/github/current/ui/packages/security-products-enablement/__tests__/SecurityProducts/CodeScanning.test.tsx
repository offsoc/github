import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import App from '../../App'
import {type SecuritySettingsContextValue, SecuritySettingsContext} from '../../contexts/SecuritySettingsContext'
import {securitySettingsContextValue} from '../test-helpers'
import {defaultAppContext} from '../../test-utils/mock-data'
import CodeScanning from '../../components/SecurityProducts/CodeScanning'

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

describe('Code scanning', () => {
  describe('Default setup', () => {
    it('renders the correct description', () => {
      render(TestComponent(<CodeScanning />), {routePayload: defaultAppContext()})

      const description = screen.getByText(
        'Receive alerts for automatically detected vulnerabilities and coding errors using CodeQL default configuration. Code scanning uses GitHub Actions and costs Actions minutes.',
      )
      expect(description).not.toBeFalsy()
    })

    it('renders the correct description for GHES', () => {
      const routePayload = defaultAppContext()
      routePayload.capabilities.ghasFreeForPublicRepos = false
      routePayload.capabilities.actionsAreBilled = false
      render(TestComponent(<CodeScanning />), {routePayload})

      const description = screen.getByText(
        'Receive alerts for automatically detected vulnerabilities and coding errors using CodeQL default configuration.',
      )
      expect(description).not.toBeFalsy()
      expect(description).not.toHaveTextContent('Code scanning uses GitHub Actions and costs Actions minutes.')
    })
  })
})
