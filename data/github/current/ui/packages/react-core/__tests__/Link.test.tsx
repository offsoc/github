import {render} from '../test-utils/Render'
import type React from 'react'
import {Link as LinkToTest, NavLink as NavLinkToTest} from '../Link'
import {AppContext} from '../app-context'
import {Link, NavLink} from 'react-router-dom'
import {jsonRoute} from '../JsonRoute'
import {createBrowserHistory} from '../create-browser-history'
import {PREVENT_AUTOFOCUS_KEY} from '../prevent-autofocus'

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  return {
    ...originalModule,
    Link: jest.fn(() => null),
    NavLink: jest.fn(() => null),
  }
})

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

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Link', () => {
  it('renders without reloadDocument when linking within the app', () => {
    render(<LinkToTest to="/a" />, {wrapper: Wrapper})
    expect(Link).toHaveBeenCalledWith(expect.objectContaining({to: '/a', reloadDocument: false}), expect.anything())
  })

  it('renders with reloadDocument when linking outside of the app', () => {
    render(<LinkToTest to="/b" />, {wrapper: Wrapper})
    expect(Link).toHaveBeenCalledWith(expect.objectContaining({to: '/b', reloadDocument: true}), expect.anything())
  })

  it('handles preventAutofocus', () => {
    render(<LinkToTest to="/b" preventAutofocus />, {wrapper: Wrapper})
    expect(Link).toHaveBeenCalledWith(
      expect.objectContaining({to: '/b', reloadDocument: true, state: {[PREVENT_AUTOFOCUS_KEY]: true}}),
      expect.anything(),
    )
  })
})

describe('NavLink', () => {
  it('renders without reloadDocument when linking within the app', () => {
    render(<NavLinkToTest to="/a" />, {wrapper: Wrapper})
    expect(NavLink).toHaveBeenCalledWith(expect.objectContaining({to: '/a', reloadDocument: false}), expect.anything())
  })

  it('renders with reloadDocument when linking outside of the app', () => {
    render(<NavLinkToTest to="/b" />, {wrapper: Wrapper})
    expect(NavLink).toHaveBeenCalledWith(expect.objectContaining({to: '/b', reloadDocument: true}), expect.anything())
  })

  it('handles preventAutofocus', () => {
    render(<NavLinkToTest to="/b" preventAutofocus />, {wrapper: Wrapper})
    expect(NavLink).toHaveBeenCalledWith(
      expect.objectContaining({to: '/b', reloadDocument: true, state: {[PREVENT_AUTOFOCUS_KEY]: true}}),
      expect.anything(),
    )
  })
})
