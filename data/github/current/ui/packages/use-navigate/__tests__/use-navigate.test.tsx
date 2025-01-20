import {render} from '@github-ui/react-core/test-utils'
import type React from 'react'
import {useNavigate as useNavigateToTest} from '../use-navigate'
import {AppContext} from '@github-ui/react-core/app-context'
import {createBrowserHistory} from '@github-ui/react-core/create-browser-history'
import {visit} from '@github/turbo'
import {screen} from '@testing-library/react'
import {jsonRoute} from '@github-ui/react-core/json-route'

const navigateFn = jest.fn()

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')

  return {
    ...originalModule,
    useNavigate: () => navigateFn,
  }
})

jest.mock('@github-ui/soft-nav/state', () => ({startSoftNav: jest.fn()}))
jest.mock('@github-ui/feature-flags', () => ({isFeatureEnabled: () => false}))
jest.mock('@github/turbo', () => ({visit: jest.fn()}))

const Wrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <AppContext.Provider
      value={{
        routes: [jsonRoute({path: '/a', Component: () => null})],
        history: createBrowserHistory(),
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

const TestButton = ({path}: {path: string}) => {
  const navigate = useNavigateToTest()
  return <button onClick={() => navigate(path)}>Navigate</button>
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useNavigate', () => {
  it('navigates using React router for destinations within the app', async () => {
    const {user} = render(<TestButton path="/a" />, {wrapper: Wrapper})
    await user.click(screen.getByText('Navigate'))
    expect(navigateFn).toHaveBeenCalledWith('/a', {})
    expect(visit).not.toHaveBeenCalled()
  })

  it('navigates using Turbo for destinations outside the app', async () => {
    const {user} = render(<TestButton path="/b" />, {wrapper: Wrapper})
    await user.click(screen.getByText('Navigate'))
    expect(navigateFn).not.toHaveBeenCalled()
    // This is hacky but seems to successfully prevent the last expectation from failing before useNavigate's
    // dynamic import of the Turbo module is done.
    await import('@github/turbo')
    expect(visit).toHaveBeenCalledWith('/b', {})
  })

  it('navigates using Turbo for full url', async () => {
    const {user} = render(<TestButton path="https://github.com" />, {wrapper: Wrapper})
    await user.click(screen.getByText('Navigate'))
    expect(navigateFn).not.toHaveBeenCalled()
    // This is hacky but seems to successfully prevent the last expectation from failing before useNavigate's
    // dynamic import of the Turbo module is done.
    await import('@github/turbo')
    expect(visit).toHaveBeenCalledWith('https://github.com', {})
  })
})
