import {render} from '@github-ui/react-core/test-utils'
import type React from 'react'
import {useSearchParams} from '../use-navigate'
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

const TestButton = ({params}: {params: URLSearchParams}) => {
  const [, setSearchParams] = useSearchParams()
  return <button onClick={() => setSearchParams(params)}>Navigate</button>
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useSearchParams', () => {
  it('navigates using React router for destinations within the app', async () => {
    const Wrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
      return (
        <AppContext.Provider
          value={{
            routes: [jsonRoute({path: '/', Component: () => null})],
            history: createBrowserHistory(),
          }}
        >
          {children}
        </AppContext.Provider>
      )
    }

    const {user} = render(<TestButton params={new URLSearchParams({a: 'a'})} />, {wrapper: Wrapper})
    await user.click(screen.getByText('Navigate'))
    expect(navigateFn).toHaveBeenCalledWith({pathname: '/', search: 'a=a'}, {})
    expect(visit).not.toHaveBeenCalled()
  })
})
