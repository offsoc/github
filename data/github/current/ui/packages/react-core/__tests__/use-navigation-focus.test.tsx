import {renderHook} from '@testing-library/react'
import {useNavigationFocus} from '../use-navigation-focus'
import type {Location} from 'react-router-dom'
import {PREVENT_AUTOFOCUS_KEY} from '../prevent-autofocus'

let increment = 1
const key = () => (increment++).toString()
function getLocation(location: Partial<Location> = {}): Location {
  return {
    pathname: '/',
    search: '',
    state: null,
    key: key(),
    hash: '',
    ...location,
  }
}

afterEach(() => {
  jest.clearAllMocks()
})

test('it focuses the autofocus element on navigation changes', async () => {
  const spy = jest.spyOn(HTMLElement.prototype, 'focus')
  const utils = renderHook(({isLoading, location}) => useNavigationFocus(isLoading, location), {
    wrapper: ({children}) => {
      return (
        <div>
          <h1 data-react-autofocus="true">text</h1>
          {children}
        </div>
      )
    },
    initialProps: {
      isLoading: false,
      location: getLocation(),
    },
  })

  expect(spy).not.toHaveBeenCalled()

  utils.rerender({isLoading: false, location: getLocation({pathname: '/next'})})

  expect(spy).toHaveBeenCalledTimes(1)

  utils.rerender({
    isLoading: false,
    location: getLocation({pathname: '/next-1'}),
  })

  expect(spy).toHaveBeenCalledTimes(2)

  utils.rerender({
    isLoading: false,
    location: getLocation({pathname: '/next-1', search: '?q=1'}),
  })

  expect(spy).toHaveBeenCalledTimes(3)
})

test('it can prevent autofocus changes', async () => {
  const spy = jest.spyOn(HTMLElement.prototype, 'focus')
  const utils = renderHook(({isLoading, location}) => useNavigationFocus(isLoading, location), {
    wrapper: ({children}) => {
      return (
        <div>
          <h1 data-react-autofocus="true">text</h1>
          {children}
        </div>
      )
    },
    initialProps: {
      isLoading: false,
      location: getLocation(),
    },
  })

  expect(spy).not.toHaveBeenCalled()

  utils.rerender({
    isLoading: false,
    location: getLocation({pathname: '/next', state: {[PREVENT_AUTOFOCUS_KEY]: true}}),
  })

  expect(spy).not.toHaveBeenCalled()

  utils.rerender({
    isLoading: false,
    location: getLocation({pathname: '/next-1', state: {[PREVENT_AUTOFOCUS_KEY]: true}}),
  })

  expect(spy).not.toHaveBeenCalled()

  utils.rerender({
    isLoading: false,
    location: getLocation({pathname: '/next-1', search: '?q=1', state: {[PREVENT_AUTOFOCUS_KEY]: true}}),
  })

  expect(spy).not.toHaveBeenCalled()
})
