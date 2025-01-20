import {act, render, renderHook, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {BrowserRouter, Route, Routes} from 'react-router-dom'

import {Link, NavLink, useLinkClickHandler, useNavigate, useSearchParams} from '../../client/router'

describe.each([{method: 'pushState' as const}, {method: 'replaceState' as const}])(
  `wraps history $method`,
  ({method}) => {
    afterEach(() => {
      jest.resetAllMocks()
    })

    function setup() {
      const user = userEvent.setup()
      const mockHistoryMethod = (window.history[method] = jest.fn())
      const replace = method === 'replaceState'
      return {user, mockHistoryMethod, replace}
    }

    const overrideState = {skipTurbo: false, abc: 'def'}
    const baseState = {skipTurbo: true}

    const nextUrl = '/some-url'

    it('link adds state by default', async () => {
      const {user, mockHistoryMethod, replace} = setup()
      render(<Link to={nextUrl} replace={replace} />, {wrapper: RoutesWrapper})
      await user.click(screen.getByRole('link'))

      expect(mockHistoryMethod).toHaveBeenCalledWith(
        expect.objectContaining({
          usr: baseState,
        }),
        '',
        nextUrl,
      )
    })

    it('link adds additional state', async () => {
      const {user, replace, mockHistoryMethod} = setup()
      render(<Link to={nextUrl} state={overrideState} replace={replace} />, {wrapper: RoutesWrapper})
      await user.click(screen.getByRole('link'))

      expect(mockHistoryMethod).toHaveBeenCalledWith(
        expect.objectContaining({
          usr: overrideState,
        }),
        '',
        nextUrl,
      )
    })

    it('navLink adds state by default', async () => {
      const {user, replace, mockHistoryMethod} = setup()
      render(<NavLink to={nextUrl} replace={replace} />, {wrapper: RoutesWrapper})

      await user.click(screen.getByRole('link'))

      expect(mockHistoryMethod).toHaveBeenCalledWith(
        expect.objectContaining({
          usr: baseState,
        }),
        '',
        nextUrl,
      )
    })

    it('navLink adds additional state', async () => {
      const {user, replace, mockHistoryMethod} = setup()
      render(<NavLink to={nextUrl} state={overrideState} replace={replace} />, {
        wrapper: RoutesWrapper,
      })

      await user.click(screen.getByRole('link'))

      expect(mockHistoryMethod).toHaveBeenCalledWith(
        expect.objectContaining({
          usr: overrideState,
        }),
        '',
        nextUrl,
      )
    })

    it('useNavigate adds state by default', () => {
      const {replace, mockHistoryMethod} = setup()
      const {result} = renderHook(() => useNavigate(), {wrapper: RoutesWrapper})
      act(() => {
        result.current(nextUrl, {replace})
      })

      expect(mockHistoryMethod).toHaveBeenCalledWith(
        expect.objectContaining({
          usr: baseState,
        }),
        '',
        nextUrl,
      )
    })

    it('useNavigate adds additional state', () => {
      const {replace, mockHistoryMethod} = setup()
      const {result} = renderHook(() => useNavigate(), {wrapper: RoutesWrapper})
      act(() => {
        result.current(nextUrl, {state: overrideState, replace})
      })

      expect(mockHistoryMethod).toHaveBeenCalledWith(
        expect.objectContaining({
          usr: overrideState,
        }),
        '',
        nextUrl,
      )
    })

    it('useSearchParams adds state by default', () => {
      const {replace, mockHistoryMethod} = setup()
      const {result} = renderHook(() => useSearchParams(), {wrapper: RoutesWrapper})
      act(() => {
        // adding some addition syntax to provide clarity around this call
        const [, setSearchParams] = result.current
        setSearchParams(
          params => {
            params.set('foo', 'bar')
            return params
          },
          {replace},
        )
      })

      expect(mockHistoryMethod).toHaveBeenCalledWith(expect.objectContaining({usr: {skipTurbo: true}}), '', '/?foo=bar')
    })

    it('useSearchParams adds additional state', () => {
      const {replace, mockHistoryMethod} = setup()
      const {result} = renderHook(() => useSearchParams(), {wrapper: RoutesWrapper})
      act(() => {
        // adding some addition syntax to provide clarity around this call
        const [, setSearchParams] = result.current
        setSearchParams(
          params => {
            params.set('foo', 'bar')
            return params
          },
          {state: overrideState, replace},
        )
      })

      expect(mockHistoryMethod).toHaveBeenCalledWith(expect.objectContaining({usr: overrideState}), '', '/?foo=bar')
    })

    it('useLinkClickHandler adds state by default', async () => {
      const {user, replace, mockHistoryMethod} = setup()
      const Component = () => {
        const handleClick = useLinkClickHandler('/some-url', {replace})
        return (
          <a href="/some-url" onClick={handleClick}>
            link
          </a>
        )
      }
      render(<Component />, {wrapper: RoutesWrapper})
      await user.click(screen.getByRole('link'))

      expect(mockHistoryMethod).toHaveBeenCalledWith(expect.objectContaining({usr: baseState}), '', nextUrl)
    })

    it('useLinkClickHandler adds additional state', async () => {
      const {user, replace, mockHistoryMethod} = setup()
      const Component = () => {
        const handleClick = useLinkClickHandler('/some-url', {state: overrideState, replace})
        return (
          <a href="/some-url" onClick={handleClick}>
            link
          </a>
        )
      }
      render(<Component />, {wrapper: RoutesWrapper})
      await user.click(screen.getByRole('link'))

      expect(mockHistoryMethod).toHaveBeenCalledWith(expect.objectContaining({usr: overrideState}), '', nextUrl)
    })
  },
)

function RoutesWrapper({children}: {children: React.ReactNode}) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={children} />
      </Routes>
    </BrowserRouter>
  )
}
